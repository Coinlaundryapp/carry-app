import { createApiClient } from '@carry/api';
import { env } from '@shared/config/env';
import { refreshTokens } from '@features/auth/api/auth';
import { tokenStore } from '@features/auth/lib/tokenStore';

/**
 * carry-platform v2 백엔드용 클라이언트(coordinator-web).
 *
 * **토큰 소유권**: coordinator-web은 carrier-web과 동일하게 NextAuth가 없다(dev-login
 * 전용 내부툴). 앱이 토큰을 직접 소유하고 `@carry/api`의 refresh coordinator를 **활성**한다
 * — 401이면 single-flight로 `/v2/auth/refresh` 회전 후 1회 재시도. 동시 회전은 백엔드(#82)
 * 재사용 감지로 세션 폐기를 부르므로 single-flight가 자폭을 막는다.
 */
export function createV2Client(opts: { baseUrl?: string; fetchImpl?: typeof fetch } = {}) {
  const baseUrl = opts.baseUrl ?? env.NEXT_PUBLIC_BACKEND_URL ?? '';
  return createApiClient({
    baseUrl,
    fetchImpl: opts.fetchImpl,
    tokenStore,
    refresh: refreshTokens,
    onLogout: () => {
      tokenStore.clear();
      if (typeof window !== 'undefined') window.location.assign('/login');
    },
  });
}

export type V2Client = ReturnType<typeof createV2Client>;
