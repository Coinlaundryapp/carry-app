import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Kakao 브라우저 OAuth 콜백.
 *
 * 옵션 B 보류: 브라우저 Kakao **코드** 흐름은 v2에 대응 엔드포인트가 없다(v1이 코드→토큰 교환을
 * 대행했음). v2 `/auth/login`은 Kakao access token을 직접 받는다. Kakao 콘솔(JS 키·도메인) 준비 후
 * JS SDK로 코드→토큰 교환 → `signIn('credentials', { kakaoAccessToken })`로 재개한다.
 * 그동안 브라우저 로그인은 미지원이며, 로컬·e2e 인증은 dev-login(devRole)을 사용한다.
 */
export async function GET(request: Request) {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  void new URL(request.url); // code/state 파싱 생략 — 미지원 안내로 리다이렉트
  return NextResponse.redirect(
    origin + `/error?error=${encodeURIComponent('browser_kakao_unsupported')}`,
  );
}
