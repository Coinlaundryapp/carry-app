import { describe, it, expect } from 'vitest';
import { formatNumberWithCommas } from './format';

describe('formatNumberWithCommas', () => {
  it('세 자리 이하 숫자는 변환 없이 반환', () => {
    expect(formatNumberWithCommas(0)).toBe('0');
    expect(formatNumberWithCommas(999)).toBe('999');
  });

  it('네 자리 이상 숫자에 쉼표 삽입', () => {
    expect(formatNumberWithCommas(1000)).toBe('1,000');
    expect(formatNumberWithCommas(12345)).toBe('12,345');
    expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
  });

  it('음수 처리', () => {
    expect(formatNumberWithCommas(-1000)).toBe('-1,000');
    expect(formatNumberWithCommas(-123456789)).toBe('-123,456,789');
  });

  it('큰 숫자 처리', () => {
    expect(formatNumberWithCommas(1000000000)).toBe('1,000,000,000');
  });
});
