import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Google from 'next-auth/providers/google';
import { isJwtExpired } from '@features/auth/lib/jwt';
import {
  devLogin,
  exchangeOAuth,
  loginWithKakao,
  refreshAccessToken,
} from '@features/auth/api/token';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    // 가입 대기 상태(백엔드가 REGISTRATION_REQUIRED로 signupToken 발급) — 후속 가입 게이트가 사용.
    signupToken?: string;
    // 가입 폼 prefill(검증 이메일/닉네임) — 검증 이메일이 있으면 폼에서 email을 고정.
    prefill?: { email?: string; nickname?: string };
    user: {
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    // 브라우저 소셜 OAuth — NextAuth v5가 AUTH_<PROVIDER>_ID/SECRET env를 자동 로드하므로
    // clientId/secret를 명시 전달하지 않는다. account.access_token은 jwt 콜백에서 백엔드로 교환.
    Kakao,
    Naver,
    Google,
    Credentials({
      credentials: {
        // WebView Kakao(네이티브 토큰), 로컬·e2e dev-login(역할), 2단계 가입 후 토큰 주입.
        kakaoAccessToken: {},
        devRole: {},
        signupAccessToken: {},
        signupRefreshToken: {},
      },
      authorize: async (credentials) => {
        try {
          const kakaoAccessToken = credentials.kakaoAccessToken as string | undefined;
          const devRole = credentials.devRole as string | undefined;
          const signupAccessToken = credentials.signupAccessToken as string | undefined;
          const signupRefreshToken = credentials.signupRefreshToken as string | undefined;

          let res;
          if (signupAccessToken && signupRefreshToken) {
            // 2단계 소셜 가입 완료: signup.ts가 백엔드에서 발급받은 토큰을 세션으로 확립.
            // 토큰은 백엔드 서명 검증을 매 API 호출마다 통과해야 하므로 위조 주입은 무력.
            res = { accessToken: signupAccessToken, refreshToken: signupRefreshToken };
          } else if (devRole) {
            // 비프로덕션 dev-login: 역할별 토큰(Kakao 불요).
            res = await devLogin(devRole);
          } else if (kakaoAccessToken) {
            // WebView 로그인: 네이티브 Kakao SDK access token → v2 서버 검증(provider=KAKAO).
            res = await loginWithKakao(kakaoAccessToken);
          } else {
            throw new Error('Invalid credentials');
          }

          return {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            (error as Error & { cause?: { err: string } }).cause = { err: error.message };
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 브라우저 소셜 OAuth: provider access token을 백엔드로 교환(가입/등록 판정).
      if (account && account.provider !== 'credentials') {
        const res = await exchangeOAuth(account.provider, account.access_token!);
        if (res.status === 'REGISTERED') {
          token.accessToken = res.accessToken;
          token.refreshToken = res.refreshToken;
          token.signupToken = undefined;
          token.prefill = undefined;
        } else {
          // REGISTRATION_REQUIRED — 가입 대기 세션: signupToken·prefill 보관, accessToken은 빈 문자열.
          token.signupToken = res.signupToken;
          token.prefill = res.prefill;
          token.accessToken = '';
        }
        return token;
      }

      // Credentials(WebView/dev) 첫 로그인: authorize가 반환한 토큰을 주입.
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      // 가입 대기 세션(signupToken 있고 accessToken 빈 문자열) 단락 — 만료검사 전에 반환.
      // isJwtExpired('')는 decodeJwt('')에서 throw하므로 이 가드가 없으면 매 요청 예외.
      if (token.signupToken && !token.accessToken) return token;

      if (token.accessToken && isJwtExpired(token.accessToken as string)) {
        const res = await refreshAccessToken(token.refreshToken as string);
        if (!res) {
          // 토큰 갱신 실패 시 빈 토큰 반환 (세션 만료 처리는 클라이언트에서)
          token.accessToken = '';
          token.refreshToken = '';
          return token;
        }
        token.accessToken = res.accessToken;
        token.refreshToken = res.refreshToken;
      }
      return token;
    },

    async session({ session, token }) {
      const updatedUser = {
        ...session.user,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
      const updatedSession = {
        ...session,
        signupToken: token.signupToken as string | undefined,
        prefill: token.prefill as { email?: string; nickname?: string } | undefined,
        user: updatedUser,
      };
      return updatedSession;
    },
  },
});
