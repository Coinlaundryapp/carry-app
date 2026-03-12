import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useModalStore } from './modal-store';

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.getState().closeModal();
  });

  it('초기 상태: isOpen이 false', () => {
    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.title).toBe('');
  });

  it('openModal로 모달 열기', () => {
    useModalStore.getState().openModal({
      type: 'basic',
      title: '알림',
      closeText: '확인',
      description: '저장되었습니다',
    });

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('basic');
    expect(state.title).toBe('알림');
    expect(state.closeText).toBe('확인');
    expect(state.description).toBe('저장되었습니다');
  });

  it('confirm 타입 모달 열기', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    useModalStore.getState().openModal({
      type: 'confirm',
      title: '삭제하시겠습니까?',
      closeText: '취소',
      confirmText: '삭제',
      onConfirm,
      onClose,
    });

    const state = useModalStore.getState();
    expect(state.type).toBe('confirm');
    expect(state.confirmText).toBe('삭제');
    expect(state.onConfirm).toBe(onConfirm);
    expect(state.onClose).toBe(onClose);
  });

  it('closeModal로 초기 상태 복구', () => {
    useModalStore.getState().openModal({
      type: 'confirm',
      title: '테스트',
      closeText: '닫기',
      confirmText: '확인',
      image: 'check',
    });

    useModalStore.getState().closeModal();

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.type).toBe('basic');
    expect(state.title).toBe('');
    expect(state.closeText).toBe('취소');
    expect(state.confirmText).toBe('');
    expect(state.image).toBe('');
  });

  it('image 프로퍼티 설정 가능', () => {
    useModalStore.getState().openModal({
      type: 'basic',
      title: '완료',
      closeText: '확인',
      image: 'check',
    });

    expect(useModalStore.getState().image).toBe('check');
  });
});
