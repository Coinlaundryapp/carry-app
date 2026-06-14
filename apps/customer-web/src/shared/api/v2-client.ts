import { createApiClient } from '@carry/api';
import { env } from '@shared/config/env';

/**
 * carry-platform v2 백엔드용 클라이언트(customer-web).
 *
 * **토큰 소유권**: customer-web은 NextAuth가 토큰을 소유한다(jwt 콜백이 `/v2/auth/refresh`로 회전).
 * 따라서 `@carry/api`에는 `refresh`를 주지 않아 401 refresh coordinator를 **비활성**한다 —
 * 이중 회전(=백엔드 #82 재사용 공격으로 간주→세션 폐기)을 구조적으로 차단. 토큰은 주입만 한다.
 *
 * - 클라이언트 컴포넌트: [useV2Client] (useSession의 accessToken 주입)
 * - 서버(컴포넌트·액션·라우트): [getServerV2Client] (auth()의 accessToken 주입)
 */
export function createV2Client(
  opts: {
    accessToken?: string;
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
) {
  // env 미설정(테스트 등)이면 ''로 폴백 → 상대경로로 현재 origin에 resolve(구 fetchExtended와 동치).
  const baseUrl = opts.baseUrl ?? env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const tokenStore = opts.accessToken
    ? {
        get: () => ({ accessToken: opts.accessToken as string, refreshToken: '' }),
        set: () => {},
        clear: () => {},
      }
    : undefined;
  // refresh 미지정 → refresh coordinator 비활성(NextAuth가 refresh 소유).
  return createApiClient({ baseUrl, fetchImpl: opts.fetchImpl, tokenStore });
}

export type V2Client = ReturnType<typeof createV2Client>;
