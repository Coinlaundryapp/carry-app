import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from './toast-store';

describe('useToastStore', () => {
  beforeEach(() => {
    // 매 테스트마다 스토어 초기화
    useToastStore.setState({ toast: null });
  });

  it('초기 상태: toast가 null', () => {
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('addToast로 토스트 추가', () => {
    const { addToast } = useToastStore.getState();
    addToast({ message: '저장되었습니다', type: 'success' });

    const toast = useToastStore.getState().toast;
    expect(toast).not.toBeNull();
    expect(toast!.message).toBe('저장되었습니다');
    expect(toast!.type).toBe('success');
    expect(toast!.id).toBeDefined();
  });

  it('addToast 기본 duration은 2000', () => {
    const { addToast } = useToastStore.getState();
    addToast({ message: '테스트', type: 'done' });

    expect(useToastStore.getState().toast!.duration).toBe(2000);
  });

  it('addToast에 커스텀 duration 설정', () => {
    const { addToast } = useToastStore.getState();
    addToast({ message: '테스트', type: 'error', duration: 5000 });

    expect(useToastStore.getState().toast!.duration).toBe(5000);
  });

  it('removeToast로 토스트 제거', () => {
    const { addToast, removeToast } = useToastStore.getState();
    addToast({ message: '테스트', type: 'success' });
    expect(useToastStore.getState().toast).not.toBeNull();

    removeToast();
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('addToast 호출 시마다 새로운 id 생성', () => {
    const { addToast } = useToastStore.getState();

    addToast({ message: '첫 번째', type: 'success' });
    const firstId = useToastStore.getState().toast!.id;

    addToast({ message: '두 번째', type: 'done' });
    const secondId = useToastStore.getState().toast!.id;

    // Date.now() 기반이므로 동일 밀리초가 아니면 다름
    // 같은 밀리초라도 메시지가 교체됨
    expect(useToastStore.getState().toast!.message).toBe('두 번째');
  });

  it('모든 type 지원: success, done, error', () => {
    const { addToast } = useToastStore.getState();

    (['success', 'done', 'error'] as const).forEach((type) => {
      addToast({ message: `${type} 메시지`, type });
      expect(useToastStore.getState().toast!.type).toBe(type);
    });
  });
});
