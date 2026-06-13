import { describe, it, expect } from 'vitest';
import { decideRetry, defaultRetryPolicy, type RetryPolicy } from './retry';
import { ApiError } from './errors';

const policy: RetryPolicy = { ...defaultRetryPolicy, jitter: () => 0 };

const err = (status: number, code: string) => new ApiError(status, code, 'm');

describe('decideRetry', () => {
  it('CONCURRENT_MODIFICATION은 백오프 없이 최대 2회 재시도', () => {
    expect(decideRetry(err(409, 'CONCURRENT_MODIFICATION'), 1, policy)).toEqual({ retry: true, delayMs: 0 });
    expect(decideRetry(err(409, 'CONCURRENT_MODIFICATION'), 2, policy)).toEqual({ retry: true, delayMs: 0 });
    expect(decideRetry(err(409, 'CONCURRENT_MODIFICATION'), 3, policy).retry).toBe(false);
  });

  it('영구 409(DUPLICATE_REVIEW 등)는 재시도하지 않는다 — 코드 기반 분기', () => {
    expect(decideRetry(err(409, 'DUPLICATE_REVIEW'), 1, policy).retry).toBe(false);
    expect(decideRetry(err(409, 'PAYMENT_ALREADY_COMPLETED'), 1, policy).retry).toBe(false);
  });

  it('IDEMPOTENT_REQUEST_IN_PROGRESS는 짧게 대기 후 재시도', () => {
    expect(decideRetry(err(409, 'IDEMPOTENT_REQUEST_IN_PROGRESS'), 1, policy)).toEqual({ retry: true, delayMs: 200 });
    expect(decideRetry(err(409, 'IDEMPOTENT_REQUEST_IN_PROGRESS'), 4, policy).retry).toBe(false);
  });

  it('503 transient는 지수 백오프, maxAttempts 초과 시 중단', () => {
    expect(decideRetry(err(503, 'PG_GATEWAY_UNAVAILABLE'), 1, policy)).toEqual({ retry: true, delayMs: 500 });
    expect(decideRetry(err(503, 'PG_GATEWAY_UNAVAILABLE'), 2, policy)).toEqual({ retry: true, delayMs: 1000 });
    expect(decideRetry(err(503, 'PG_GATEWAY_UNAVAILABLE'), 3, policy)).toEqual({ retry: true, delayMs: 2000 });
    // cap: base*2^3=4000 < 8000 cap → 4000; attempt 4 == maxAttempts → 중단
    expect(decideRetry(err(503, 'PG_GATEWAY_UNAVAILABLE'), 4, policy).retry).toBe(false);
  });

  it('503이라도 transient 코드가 아니면 재시도 안 함', () => {
    expect(decideRetry(err(503, 'SOMETHING_ELSE'), 1, policy).retry).toBe(false);
  });

  it('일반 4xx(404·403·400)는 재시도 안 함', () => {
    expect(decideRetry(err(404, 'ORDER_NOT_FOUND'), 1, policy).retry).toBe(false);
    expect(decideRetry(err(403, 'FORBIDDEN'), 1, policy).retry).toBe(false);
  });

  it('ApiError가 아닌 에러는 재시도 안 함', () => {
    expect(decideRetry(new Error('network'), 1, policy).retry).toBe(false);
  });
});
