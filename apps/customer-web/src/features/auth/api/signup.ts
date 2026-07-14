import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

// /api/v2/auth/** 는 백엔드 permitAll — 토큰 없이 호출한다(signupToken이 본문의 인가 근거).
const authClient = createV2Client();

/**
 * 2단계 소셜 가입(v2) — 로그인 단계가 발급한 signupToken + 사용자 입력(name/phone/email)으로
 * 계정을 생성하고 인증 토큰(access/refresh)을 발급받는다.
 *
 * ⚠️ 이메일 중복 시 백엔드는 **409**를 반환(ApiError.status === 409) — 호출측이 잡아 UX 처리.
 * ⚠️ 검증된 이메일로 발급된 signupToken이면 백엔드가 계정 이메일을 그 값으로 고정하므로
 *    폼 단계에서 email 필드를 고정(비편집)해 전송값이 검증 이메일과 일치해야 한다.
 */
export async function postSignup(
  body: Schemas['SignupRequest'],
): Promise<Schemas['TokenResponse']> {
  return authClient.request<Schemas['TokenResponse']>('/api/v2/auth/signup', {
    method: 'POST',
    body,
  });
}
