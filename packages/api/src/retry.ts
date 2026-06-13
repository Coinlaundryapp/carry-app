import { ApiError } from './errors';

/**
 * 클라이언트 재시도 정책 — `docs/14-client-retry-guide.md`를 코드로 옮긴 것.
 * 재시도 판단은 HTTP status가 아니라 에러 `code`로 한다.
 */
export interface RetryPolicy {
  /** 503(Circuit Breaker OPEN 등) 지수 백오프 파라미터. */
  baseMs: number;
  capMs: number;
  maxAttempts: number;
  /** 결정적 테스트를 위한 jitter 주입(기본: 0~300ms 균등). */
  jitter: () => number;
}

export const defaultRetryPolicy: RetryPolicy = {
  baseMs: 500,
  capMs: 8000,
  maxAttempts: 4,
  jitter: () => Math.floor(Math.random() * 300),
};

/** transient(재시도 가능) 에러 코드. */
const TRANSIENT_503 = new Set([
  'PG_GATEWAY_UNAVAILABLE',
  'GEOCODING_UNAVAILABLE',
  'OAUTH_PROVIDER_UNAVAILABLE',
]);

export interface RetryDecision {
  retry: boolean;
  delayMs: number;
}

/**
 * 시도 `attempt`(1-base)에서 받은 에러로 다음 행동을 결정한다.
 * - `CONCURRENT_MODIFICATION`(409): 백오프 없이 즉시 재시도(최대 2회) — 충돌 상대는 이미 커밋됨
 * - `IDEMPOTENT_REQUEST_IN_PROGRESS`(409): 같은 키로 짧게 대기 후 재시도
 * - 503 transient(PG/Geo/OAuth): 지수 백오프 `min(base·2^(n-1), cap)+jitter`, maxAttempts까지
 * - 그 외(4xx 영구·404·403 등): 재시도 안 함
 */
export function decideRetry(error: unknown, attempt: number, policy: RetryPolicy): RetryDecision {
  const noRetry: RetryDecision = { retry: false, delayMs: 0 };
  if (!(error instanceof ApiError)) return noRetry;

  if (error.code === 'CONCURRENT_MODIFICATION') {
    return attempt <= 2 ? { retry: true, delayMs: 0 } : noRetry;
  }
  if (error.code === 'IDEMPOTENT_REQUEST_IN_PROGRESS') {
    return attempt <= 3 ? { retry: true, delayMs: 200 } : noRetry;
  }
  if (error.status === 503 && TRANSIENT_503.has(error.code)) {
    if (attempt >= policy.maxAttempts) return noRetry;
    const backoff = Math.min(policy.baseMs * 2 ** (attempt - 1), policy.capMs);
    return { retry: true, delayMs: backoff + policy.jitter() };
  }
  return noRetry;
}
