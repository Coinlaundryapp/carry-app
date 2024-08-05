import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        code: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const code = credentials.code;

        //TODO: 백엔드 서버로 code를 보내어 토큰 발급받기

        user = {
          name: 'Test User',
        };

        if (!user) {
          throw new Error('User not found.');
        }

        return user;
      },
    }),
  ],
});
