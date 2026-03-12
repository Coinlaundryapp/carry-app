import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { isJwtExpired } from '@features/auth/lib/jwt';
import { login, loginWithKakaoToken, refreshAccessToken } from '@features/auth/api/token';

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
        code: {},
        redirectUri: {},
        kakaoAccessToken: {},
      },
      authorize: async (credentials) => {
        try {
          const kakaoAccessToken = credentials.kakaoAccessToken as string;
          let res;

          if (kakaoAccessToken) {
            // WebView 로그인: 네이티브 카카오 SDK에서 받은 accessToken
            res = await loginWithKakaoToken({ accessToken: kakaoAccessToken });
          } else {
            // 브라우저 로그인: 카카오 OAuth 인가 코드
            const authorizationCode = credentials.code as string;
            const redirectUri = credentials.redirectUri as string;

            if (!authorizationCode) {
              throw new Error('Invalid authorization code');
            }
            res = await login({ authorizationCode, redirectUri });
          }

          if (res) {
            return {
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            };
          }
          throw new Error('Authentication failed');
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
        const res = await refreshAccessToken({ refreshToken: token.refreshToken as string });
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
