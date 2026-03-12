import { describe, it, expect, beforeEach } from 'vitest';
import { useAddressStore } from './address-store';

describe('address-store', () => {
  beforeEach(() => {
    // 각 테스트 전 초기 상태로 리셋
    useAddressStore.setState({
      selectedAddressId: null,
      addressModalOpen: false,
      shouldRefetch: false,
    });
  });

  describe('초기 상태', () => {
    it('selectedAddressId는 null', () => {
      expect(useAddressStore.getState().selectedAddressId).toBeNull();
    });

    it('addressModalOpen은 false', () => {
      expect(useAddressStore.getState().addressModalOpen).toBe(false);
    });

    it('shouldRefetch는 false', () => {
      expect(useAddressStore.getState().shouldRefetch).toBe(false);
    });
  });

  describe('setSelectedAddressId', () => {
    it('주소 ID를 설정한다', () => {
      useAddressStore.getState().setSelectedAddressId(5);
      expect(useAddressStore.getState().selectedAddressId).toBe(5);
    });

    it('다른 값으로 변경할 수 있다', () => {
      useAddressStore.getState().setSelectedAddressId(5);
      useAddressStore.getState().setSelectedAddressId(10);
      expect(useAddressStore.getState().selectedAddressId).toBe(10);
    });
  });

  describe('setAddressModalOpen', () => {
    it('모달 열기', () => {
      useAddressStore.getState().setAddressModalOpen(true);
      expect(useAddressStore.getState().addressModalOpen).toBe(true);
    });

    it('모달 닫기', () => {
      useAddressStore.getState().setAddressModalOpen(true);
      useAddressStore.getState().setAddressModalOpen(false);
      expect(useAddressStore.getState().addressModalOpen).toBe(false);
    });
  });

  describe('triggerRefetch', () => {
    it('shouldRefetch를 토글한다 (false → true)', () => {
      expect(useAddressStore.getState().shouldRefetch).toBe(false);
      useAddressStore.getState().triggerRefetch();
      expect(useAddressStore.getState().shouldRefetch).toBe(true);
    });

    it('연속 호출 시 boolean 토글 정상 동작', () => {
      useAddressStore.getState().triggerRefetch();
      expect(useAddressStore.getState().shouldRefetch).toBe(true);

      useAddressStore.getState().triggerRefetch();
      expect(useAddressStore.getState().shouldRefetch).toBe(false);

      useAddressStore.getState().triggerRefetch();
      expect(useAddressStore.getState().shouldRefetch).toBe(true);
    });
  });

  describe('setShouldRefetch', () => {
    it('직접 값을 설정한다', () => {
      useAddressStore.getState().setShouldRefetch(true);
      expect(useAddressStore.getState().shouldRefetch).toBe(true);

      useAddressStore.getState().setShouldRefetch(false);
      expect(useAddressStore.getState().shouldRefetch).toBe(false);
    });
  });
});
