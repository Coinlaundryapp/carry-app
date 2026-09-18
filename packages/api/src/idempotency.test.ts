import { describe, it, expect } from 'vitest';
import { newIdempotencyKey, newIdempotencyAttempt } from './idempotency';

describe('idempotency', () => {
  it('newIdempotencyKey는 매번 다른 UUID를 생성한다', () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });

  it('한 시도(attempt)의 key는 고정 — 같은 키로 재전송한다', () => {
    const attempt = newIdempotencyAttempt();
    expect(attempt.key).toBe(attempt.key);
    expect(newIdempotencyAttempt().key).not.toBe(attempt.key);
  });
});
