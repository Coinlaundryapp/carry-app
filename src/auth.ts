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
  providers: [
    Credentials({
      credentials: {
        code: {},
      },
      authorize: async (credentials) => {
        let user = {
          accessToken: '',
          refreshToken: '',
        };
        const code = credentials.code as string;
        const res = await login({ code });
        if (res) {
          user = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
        }
        return user;
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
        user: updatedUser,
      };
      return updatedSession;
    },
  },
});
