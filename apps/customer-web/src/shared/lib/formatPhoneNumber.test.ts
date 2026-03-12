import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from './formatPhoneNumber';

describe('formatPhoneNumber', () => {
  it('3자리 이하는 그대로 반환', () => {
    expect(formatPhoneNumber('010')).toBe('010');
    expect(formatPhoneNumber('01')).toBe('01');
  });

  it('4~7자리에 하이픈 1개 삽입', () => {
    expect(formatPhoneNumber('0101')).toBe('010-1');
    expect(formatPhoneNumber('0101234')).toBe('010-1234');
  });

  it('8자리 이상에 하이픈 2개 삽입 (010-XXXX-XXXX)', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('01087654321')).toBe('010-8765-4321');
  });

  it('숫자가 아닌 문자 제거', () => {
    expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('010 1234 5678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('abc01012345678xyz')).toBe('010-1234-5678');
  });

  it('빈 문자열 처리', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});
