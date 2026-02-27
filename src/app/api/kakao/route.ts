import { signIn } from '@features/auth/api/auth';
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

  let redirectUrl = '/login-done';
  if (state && state !== 'undefined') {
    try {
      const stateObj = JSON.parse(decodeURIComponent(state));
      const { redirect, query } = stateObj;
      if (redirect) {
        redirectUrl = `/login-done/${redirect}`;

        if (query && Object.keys(query).length > 0) {
          const queryString = new URLSearchParams(query as Record<string, string>).toString();
          redirectUrl += `?${queryString}`;
        }
      }
    } catch (error) {
      console.error('Failed to parse state:', error);
    }
  }

  try {
    await signIn('credentials', {
      code: code as string,
      redirectUri: origin + '/api/kakao',
      redirect: false,
    });
    return NextResponse.redirect(origin + redirectUrl);
  } catch (error) {
    console.error('Sign in error:', error);
    // @ts-ignore
    const errorMessage = error.cause?.err || 'Unknown error';
    return NextResponse.redirect(origin + `/error?error=${encodeURIComponent(errorMessage)}`);
  }
}
