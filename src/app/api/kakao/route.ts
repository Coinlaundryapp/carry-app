import { signIn } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectUrl = state === 'undefined' ? '/login-done' : `/login-done/${state}`;

  try {
    await signIn('credentials', {
      code: code as string,
      redirect: false,
    });
    return NextResponse.redirect(origin + redirectUrl);
  } catch (error) {
    // @ts-ignore
    return NextResponse.redirect(origin + `/error?error=${error.cause.err}`);
  }
}
