import { describe, it, expect, beforeEach } from 'vitest';
import useOrderStore from './order-store';

describe('useOrderStore', () => {
  beforeEach(() => {
    // 매 테스트마다 스토어 초기화
    useOrderStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('기본값 확인', () => {
      const state = useOrderStore.getState();
      expect(state.totalAmount).toBe(0);
      expect(state.step).toBe(0);
      expect(state.laundromat).toBeNull();
      expect(state.addressId).toBeNull();
      expect(state.orderContent.laundrySpecs).toEqual([]);
      expect(state.orderSchedule.desiredPickupDateTime).toBe('');
    });
  });

  describe('setStep', () => {
    it('step 변경', () => {
      useOrderStore.getState().setStep(3);
      expect(useOrderStore.getState().step).toBe(3);
    });
  });

  describe('totalAmount 조작', () => {
    it('addTotalAmount로 금액 추가', () => {
      useOrderStore.getState().addTotalAmount(5000);
      expect(useOrderStore.getState().totalAmount).toBe(5000);

      useOrderStore.getState().addTotalAmount(3000);
      expect(useOrderStore.getState().totalAmount).toBe(8000);
    });

    it('removeTotalAmount로 금액 차감', () => {
      useOrderStore.getState().addTotalAmount(10000);
      useOrderStore.getState().removeTotalAmount(3000);
      expect(useOrderStore.getState().totalAmount).toBe(7000);
    });
  });

  describe('setOrderContent', () => {
    it('부분 업데이트 (기존 값 보존)', () => {
      useOrderStore.getState().setOrderContent({ washOption: 'delicate' as never });

      const content = useOrderStore.getState().orderContent;
      expect(content.washOption).toBe('delicate');
      expect(content.laundrySpecs).toEqual([]); // 기존 값 보존
    });
  });

  describe('setAddressId', () => {
    it('주소 ID 설정', () => {
      useOrderStore.getState().setAddressId(42);
      expect(useOrderStore.getState().addressId).toBe(42);
    });
  });

  describe('setOrderSchedule', () => {
    it('일정 설정', () => {
      useOrderStore.getState().setOrderSchedule({
        desiredPickupDateTime: '2024-03-15T10:00',
        desiredDeliveryDateTime: '2024-03-17T14:00',
      });

      const schedule = useOrderStore.getState().orderSchedule;
      expect(schedule.desiredPickupDateTime).toBe('2024-03-15T10:00');
      expect(schedule.desiredDeliveryDateTime).toBe('2024-03-17T14:00');
    });
  });

  describe('reset', () => {
    it('모든 상태 초기화', () => {
      // 다양한 상태 변경
      useOrderStore.getState().setStep(5);
      useOrderStore.getState().addTotalAmount(50000);
      useOrderStore.getState().setAddressId(99);

      // 리셋
      useOrderStore.getState().reset();

      const state = useOrderStore.getState();
      expect(state.step).toBe(0);
      expect(state.totalAmount).toBe(0);
      expect(state.laundromat).toBeNull();
    });

    it('reset에 초기 타입 파라미터 전달 가능', () => {
      useOrderStore.getState().reset('unit' as never, 'wash' as never, 'shirt' as never);

      const content = useOrderStore.getState().orderContent;
      expect(content.orderUnitType).toBe('unit');
      expect(content.orderRequestType).toBe('wash');
      expect(content.laundryItemType).toBe('shirt');
      expect(content.laundrySpecs).toEqual([]);
    });
  });
});
