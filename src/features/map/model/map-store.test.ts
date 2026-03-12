import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from './map-store';

const mockLaundromat = {
  id: 1,
  address: '서울시 강남구',
  distance: 500,
  groupDeliveryFee: 3000,
  latitude: 37.5,
  longitude: 127.0,
  mediaResources: [],
  name: '테스트 세탁소',
  options: ['WASHING_MACHINE' as const],
  reviewAverageRating: 4.5,
  reviewCount: 10,
};

describe('map-store', () => {
  beforeEach(() => {
    useMapStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('selectedMarkerId는 0', () => {
      expect(useMapStore.getState().selectedMarkerId).toBe(0);
    });

    it('selectedItem은 null', () => {
      expect(useMapStore.getState().selectedItem).toBeNull();
    });

    it('open은 false', () => {
      expect(useMapStore.getState().open).toBe(false);
    });

    it('zoomLevel은 12', () => {
      expect(useMapStore.getState().zoomLevel).toBe(12);
    });

    it('isOffsetMarkerVisible은 true', () => {
      expect(useMapStore.getState().isOffsetMarkerVisible).toBe(true);
    });

    it('isUserMarkerVisible은 false', () => {
      expect(useMapStore.getState().isUserMarkerVisible).toBe(false);
    });
  });

  describe('setSelectedMarkerId', () => {
    it('마커 ID를 설정한다', () => {
      useMapStore.getState().setSelectedMarkerId(5);
      expect(useMapStore.getState().selectedMarkerId).toBe(5);
    });
  });

  describe('setSelectedItem', () => {
    it('선택된 세탁소를 설정한다', () => {
      useMapStore.getState().setSelectedItem(mockLaundromat);
      expect(useMapStore.getState().selectedItem).toEqual(mockLaundromat);
    });

    it('null로 초기화할 수 있다', () => {
      useMapStore.getState().setSelectedItem(mockLaundromat);
      useMapStore.getState().setSelectedItem(null);
      expect(useMapStore.getState().selectedItem).toBeNull();
    });
  });

  describe('setOpen', () => {
    it('패널을 연다', () => {
      useMapStore.getState().setOpen(true);
      expect(useMapStore.getState().open).toBe(true);
    });

    it('패널을 닫는다', () => {
      useMapStore.getState().setOpen(true);
      useMapStore.getState().setOpen(false);
      expect(useMapStore.getState().open).toBe(false);
    });
  });

  describe('setZoomLevel', () => {
    it('줌 레벨을 변경한다', () => {
      useMapStore.getState().setZoomLevel(15);
      expect(useMapStore.getState().zoomLevel).toBe(15);
    });
  });

  describe('reset', () => {
    it('모든 필드를 초기값으로 복원한다', () => {
      // 상태 변경
      useMapStore.getState().setSelectedMarkerId(5);
      useMapStore.getState().setSelectedItem(mockLaundromat);
      useMapStore.getState().setOpen(true);
      useMapStore.getState().setZoomLevel(15);
      useMapStore.getState().setIsOffsetMarkerVisible(false);
      useMapStore.getState().setIsUserMarkerVisible(true);

      // 리셋
      useMapStore.getState().reset();

      // 검증
      expect(useMapStore.getState().selectedMarkerId).toBe(0);
      expect(useMapStore.getState().selectedItem).toBeNull();
      expect(useMapStore.getState().open).toBe(false);
      expect(useMapStore.getState().zoomLevel).toBe(12);
      expect(useMapStore.getState().isOffsetMarkerVisible).toBe(true);
      expect(useMapStore.getState().isUserMarkerVisible).toBe(false);
    });
  });

  describe('상태 전이 시나리오', () => {
    it('select → open → deselect → close', () => {
      // 마커 선택
      useMapStore.getState().setSelectedMarkerId(1);
      useMapStore.getState().setSelectedItem(mockLaundromat);
      useMapStore.getState().setOpen(true);
      expect(useMapStore.getState().selectedMarkerId).toBe(1);
      expect(useMapStore.getState().open).toBe(true);

      // 마커 해제
      useMapStore.getState().setSelectedMarkerId(0);
      useMapStore.getState().setSelectedItem(null);
      useMapStore.getState().setOpen(false);
      expect(useMapStore.getState().selectedMarkerId).toBe(0);
      expect(useMapStore.getState().selectedItem).toBeNull();
      expect(useMapStore.getState().open).toBe(false);
    });
  });
});
