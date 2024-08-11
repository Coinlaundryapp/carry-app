import { signIn } from '@/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectUrl = state === 'undefined' ? '/' : `/${state}`;
  await signIn('credentials', {
    formData: {
      code,
    },
    redirectTo: redirectUrl,
  });
}
