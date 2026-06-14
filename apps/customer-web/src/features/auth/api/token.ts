import { ApiError } from '@carry/api';
import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

// /api/v2/auth/** 는 백엔드 permitAll — 토큰 없이 호출한다.
const authClient = createV2Client();

type Tokens = { accessToken: string; refreshToken: string };

/**
 * Kakao 로그인(v2) — 네이티브 SDK가 발급한 Kakao access token을 서버가 검증한다(WebView 경로).
 * 신규 유저면 REGISTRATION_REQUIRED → 2-step 가입(`/auth/signup`)이 필요하다(후속).
 *
 * ⚠️ 브라우저 OAuth **코드** 흐름은 v2에 대응 엔드포인트가 없다(v1이 코드 교환을 대행했음).
 * 옵션 B: 브라우저 실 Kakao는 콘솔 준비 시 재개, 로컬·e2e는 [devLogin] 사용.
 */
export async function loginWithKakao(kakaoAccessToken: string): Promise<Tokens> {
  const data = await authClient.request<Schemas['LoginResponse']>('/api/v2/auth/login', {
    method: 'POST',
    body: { kakaoAccessToken },
  });
  if (data.status === 'REGISTERED' && data.accessToken && data.refreshToken) {
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  }
  // REGISTRATION_REQUIRED — 가입 폼(name/phone/email)→/auth/signup 흐름은 후속.
  throw new Error('registration_required');
}

/** 비프로덕션 dev-login(v2) — Kakao 없이 역할별 토큰. 로컬·e2e의 기본 인증 경로. */
export async function devLogin(role: string): Promise<Tokens> {
  const data = await authClient.request<Schemas['TokenResponse']>('/api/v2/auth/dev-login', {
    method: 'POST',
    body: { role },
  });
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

/** refresh 토큰 회전(v2) — 새 access+refresh 발급, 이전 토큰 무효화(#82). 실패 시 null. */
export async function refreshAccessToken(refreshToken: string): Promise<Tokens | null> {
  try {
    const data = await authClient.request<Schemas['TokenResponse']>('/api/v2/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (error) {
    // 회전 실패(만료·재사용감지)는 정상 흐름의 일부 — 세션 만료로 처리(클라이언트).
    if (!(error instanceof ApiError)) {
      console.error('[Auth] Token refresh failed:', error);
    }
    return null;
  }
}
