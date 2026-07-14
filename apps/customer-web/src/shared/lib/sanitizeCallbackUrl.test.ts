import { describe, it, expect } from 'vitest';
import { sanitizeCallbackUrl } from './sanitizeCallbackUrl';

describe('sanitizeCallbackUrl', () => {
  it('같은 오리진 상대 경로는 그대로 통과', () => {
    expect(sanitizeCallbackUrl('/orders/123')).toBe('/orders/123');
    expect(sanitizeCallbackUrl('/login-done/payment/1')).toBe('/login-done/payment/1');
  });

  it('콜론/해시가 있는 정상 경로는 그대로 통과(과도 차단 회귀 방지)', () => {
    // 이전 `:` 검사가 잘못 막던 케이스 — origin 검증으로 전환 후 통과해야 한다.
    expect(sanitizeCallbackUrl('/search?q=12:30')).toBe('/search?q=12:30');
    expect(sanitizeCallbackUrl('/orders/123#top')).toBe('/orders/123#top');
  });

  it.each([
    ['https://evil.com'], // 절대 URL(스킴)
    ['//evil.com'], // protocol-relative
    ['/\\evil.com'], // 역슬래시 우회
    ['javascript:alert(1)'], // javascript 스킴
    ['/\t/evil.com'], // 탭 컨트롤 문자 우회(WHATWG 파서가 제거 → //evil.com)
    ['/\n/evil.com'], // 개행 컨트롤 문자 우회
    ['/\r/evil.com'], // 캐리지리턴 컨트롤 문자 우회
    [''], // 빈 문자열
    [undefined], // undefined
    [42], // 문자열 아님
  ] as const)('안전하지 않은 값(%j)은 기본값으로 대체', (raw) => {
    expect(sanitizeCallbackUrl(raw)).toBe('/login-done');
  });

  it('커스텀 fallback을 사용할 수 있다', () => {
    expect(sanitizeCallbackUrl('https://evil.com', '/')).toBe('/');
  });
});
