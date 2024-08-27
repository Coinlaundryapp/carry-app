import { signIn } from '@/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
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
