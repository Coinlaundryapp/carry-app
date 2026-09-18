import type { TokenPair } from '@carry/api';
import { unwrap } from '@carry/api';
import type { Schemas } from '@carry/types';
import { env } from '@shared/config/env';

/**
 * carrier 인증 API — dev-login(역할 토큰 발급)과 refresh(토큰 회전).
 *
 * 인증 호출은 authed 클라이언트보다 먼저(devLogin) 또는 coordinator 내부(refresh)에서
 * 일어나므로 `@carry/api` 클라이언트를 거치지 않고 plain fetch로 직접 친다. 봉투 해석은
 * `@carry/api`의 [unwrap]을 재사용한다.
 */

type TokenResponse = Schemas['TokenResponse'];
type CarrierRole = 'CARRIER';

function baseUrl(): string {
  return env.NEXT_PUBLIC_BACKEND_URL ?? '';
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(baseUrl() + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return unwrap<T>(res);
}

/** dev-login — 역할로 결정적 dev 사용자를 get-or-create하고 토큰을 발급한다. */
export async function devLogin(role: CarrierRole = 'CARRIER'): Promise<TokenResponse> {
  return postJson<TokenResponse>('/api/v2/auth/dev-login', { role });
}

/**
 * refresh 토큰으로 새 토큰쌍을 회전 발급한다(`POST /api/v2/auth/refresh`).
 * refresh coordinator 계약상 실패(회전 거부·세션 폐기)는 throw가 아니라 null로 신호한다.
 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  try {
    return await postJson<TokenPair>('/api/v2/auth/refresh', { refreshToken });
  } catch {
    return null;
  }
}
