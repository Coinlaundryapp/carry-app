import { describe, it, expect } from 'vitest';
import { sanitizeCallbackUrl } from './sanitizeCallbackUrl';

describe('sanitizeCallbackUrl', () => {
  it('같은 오리진 상대 경로는 그대로 통과', () => {
    expect(sanitizeCallbackUrl('/orders/123')).toBe('/orders/123');
    expect(sanitizeCallbackUrl('/login-done/payment/1')).toBe('/login-done/payment/1');
  });

  it.each([
    ['https://evil.com'], // 절대 URL(스킴)
    ['//evil.com'], // protocol-relative
    ['/\\evil.com'], // 역슬래시 우회
    ['javascript:alert(1)'], // javascript 스킴
    [''], // 빈 문자열
    [undefined], // undefined
    [42], // 문자열 아님
  ] as const)('안전하지 않은 값(%s)은 기본값으로 대체', (raw) => {
    expect(sanitizeCallbackUrl(raw)).toBe('/login-done');
  });

  it('커스텀 fallback을 사용할 수 있다', () => {
    expect(sanitizeCallbackUrl('https://evil.com', '/')).toBe('/');
  });
});
