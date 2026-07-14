import { NextResponse } from 'next/server';
import { auth } from '@features/auth/api/auth';

/**
 * 가입 게이트 — REGISTRATION_REQUIRED 세션(signupToken 있고 accessToken 없음)은 `/signup`으로 보낸다.
 * 로그인 완료(accessToken 존재) 또는 비로그인은 통과. `/signup` 자신은 제외해 무한 루프를 막는다.
 *
 * config.matcher가 `/api/*`, `_next/*`, 정적 파일(확장자 포함 경로)을 제외하므로
 * OAuth 콜백(`/api/auth/*`)과 에셋 요청은 이 핸들러를 타지 않는다.
 */
export default auth((req) => {
  const session = req.auth;
  const isSignupPending = Boolean(session?.signupToken) && !session?.user?.accessToken;

  if (isSignupPending && req.nextUrl.pathname !== '/signup') {
    return NextResponse.redirect(new URL('/signup', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // api(전체, OAuth 콜백 포함)·_next 정적/이미지·확장자 있는 파일(favicon·이미지·manifest 등) 제외.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.).*)'],
};
