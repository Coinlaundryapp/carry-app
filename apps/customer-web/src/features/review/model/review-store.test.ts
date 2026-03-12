import { describe, it, expect, beforeEach } from 'vitest';
import { useReviewStore } from './review-store';

describe('review-store', () => {
  beforeEach(() => {
    useReviewStore.setState({ text: '' });
  });

  describe('초기 상태', () => {
    it('text는 빈 문자열', () => {
      expect(useReviewStore.getState().text).toBe('');
    });
  });

  describe('setText', () => {
    it('텍스트를 설정한다', () => {
      useReviewStore.getState().setText('좋은 세탁소입니다');
      expect(useReviewStore.getState().text).toBe('좋은 세탁소입니다');
    });

    it('텍스트를 변경할 수 있다', () => {
      useReviewStore.getState().setText('첫 번째 리뷰');
      useReviewStore.getState().setText('수정된 리뷰');
      expect(useReviewStore.getState().text).toBe('수정된 리뷰');
    });

    it('빈 문자열도 설정 가능', () => {
      useReviewStore.getState().setText('리뷰 텍스트');
      useReviewStore.getState().setText('');
      expect(useReviewStore.getState().text).toBe('');
    });
  });

  describe('reset', () => {
    it('텍스트를 빈 문자열로 초기화한다', () => {
      useReviewStore.getState().setText('리뷰 내용');
      useReviewStore.getState().reset();
      expect(useReviewStore.getState().text).toBe('');
    });

    it('setText 후 reset → 완전 초기화', () => {
      useReviewStore.getState().setText('긴 리뷰 텍스트입니다. 세탁 품질이 좋았습니다.');
      expect(useReviewStore.getState().text).not.toBe('');

      useReviewStore.getState().reset();
      expect(useReviewStore.getState().text).toBe('');
    });

    it('이미 빈 상태에서 reset 호출해도 에러 없음', () => {
      expect(() => useReviewStore.getState().reset()).not.toThrow();
      expect(useReviewStore.getState().text).toBe('');
    });
  });
});
