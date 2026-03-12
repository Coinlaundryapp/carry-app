import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeJwt, isJwtExpired } from './jwt';

// 간단한 JWT 생성 헬퍼 (서명 없이 payload만)
function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

describe('decodeJwt', () => {
  it('유효한 JWT에서 payload 추출', () => {
    const token = createMockJwt({ exp: 1700000000, sub: 'user-123' });
    const decoded = decodeJwt(token);

    expect(decoded.exp).toBe(1700000000);
    expect(decoded.sub).toBe('user-123');
  });

  it('잘못된 토큰이면 에러 throw', () => {
    expect(() => decodeJwt('not-a-jwt')).toThrow('Invalid token');
    expect(() => decodeJwt('')).toThrow('Invalid token');
  });
});

describe('isJwtExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('만료된 토큰은 true 반환', () => {
    // 2023-11-14T22:13:20Z — 과거 시점
    const pastExp = 1700000000;
    const token = createMockJwt({ exp: pastExp });

    // 현재 시간을 만료 시점 이후로 설정
    vi.setSystemTime(new Date((pastExp + 3600) * 1000));

    expect(isJwtExpired(token)).toBe(true);
  });

  it('아직 유효한 토큰은 false 반환', () => {
    const futureExp = 1700000000;
    const token = createMockJwt({ exp: futureExp });

    // 현재 시간을 만료 시점 이전으로 설정
    vi.setSystemTime(new Date((futureExp - 3600) * 1000));

    expect(isJwtExpired(token)).toBe(false);
  });

  it('exp 없는 토큰은 true 반환 (만료 취급)', () => {
    const token = createMockJwt({ sub: 'user-123' });
    // decodeJwt는 exp를 반환하지만, 원본 코드에서 !decoded.exp 체크함
    // exp가 0이거나 undefined이면 true
    vi.setSystemTime(new Date(2024, 0, 1));

    expect(isJwtExpired(token)).toBe(true);
  });
});
