import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className merge)', () => {
  it('단일 클래스 반환', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('여러 클래스 병합', () => {
    expect(cn('p-4', 'mt-2')).toBe('p-4 mt-2');
  });

  it('Tailwind 충돌 클래스 해결 (후자 우선)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('조건부 클래스 처리', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('undefined/null 무시', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });

  it('빈 호출시 빈 문자열', () => {
    expect(cn()).toBe('');
  });
});
