import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { isJwtExpired } from '@/lib/jwt';
import { login, refreshAccessToken } from '@/api/token';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user?: {
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
      },
      authorize: async (credentials) => {
        const authorizationCode = credentials.code as string;
        if (!authorizationCode) {
          throw new Error('Invalid authorization code');
        }
        try {
          const res = await login({ authorizationCode });
          if (res) {
            return {
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            };
          }
          throw new Error('Authentication failed');
        } catch (error) {
          // @ts-ignore
          error.cause = { err: error.message };
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
