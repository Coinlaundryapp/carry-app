import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { isJwtExpired } from '@features/auth/lib/jwt';
import { devLogin, loginWithKakao, refreshAccessToken } from '@features/auth/api/token';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user: {
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        // WebView Kakao(네이티브 토큰), 로컬·e2e dev-login(역할). 브라우저 OAuth 코드 흐름은
        // v2 미지원(옵션 B 보류)이라 제거 — 콘솔 준비 시 Kakao JS SDK 토큰 교환으로 재개.
        kakaoAccessToken: {},
        devRole: {},
      },
      authorize: async (credentials) => {
        try {
          const kakaoAccessToken = credentials.kakaoAccessToken as string | undefined;
          const devRole = credentials.devRole as string | undefined;

          let res;
          if (devRole) {
            // 비프로덕션 dev-login: 역할별 토큰(Kakao 불요).
            res = await devLogin(devRole);
          } else if (kakaoAccessToken) {
            // WebView 로그인: 네이티브 Kakao SDK access token → v2 서버 검증.
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
      if (account && user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }

      if (token && isJwtExpired(token.accessToken as string)) {
        const res = await refreshAccessToken(token.refreshToken as string);
        if (!res) {
          // 토큰 갱신 실패 시 기존 토큰 반환 (세션 만료 처리는 클라이언트에서)
          return { ...token, accessToken: '', refreshToken: '' };
        }
        return {
          ...token,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        };
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
        user: updatedUser,
      };
      return updatedSession;
    },
  },
});
