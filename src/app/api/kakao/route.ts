import { signIn } from '@/auth';
import { NextResponse } from 'next/server';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectUrl = state === 'undefined' ? '/login-done' : `/login-done/${state}`;
  try {
    await signIn('credentials', {
      code: code as string,
      redirect: false,
    });
    return NextResponse.redirect(BASE_URL + redirectUrl);
  } catch (error) {
    // @ts-ignore
    return NextResponse.redirect(BASE_URL + `/error?error=${error.cause.err}`);
  }
}
