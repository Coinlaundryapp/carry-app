import { describe, it, expect, beforeEach } from 'vitest';
import { useLocationStore } from './location-store';

describe('location-store', () => {
  beforeEach(() => {
    useLocationStore.setState({
      location: { lat: 0, lng: 0 },
    });
  });

  describe('초기 상태', () => {
    it('location 기본값은 { lat: 0, lng: 0 }', () => {
      const { location } = useLocationStore.getState();
      expect(location).toEqual({ lat: 0, lng: 0 });
    });
  });

  describe('setLocation', () => {
    it('좌표를 정상적으로 설정한다', () => {
      useLocationStore.getState().setLocation(37.5, 127.0);
      const { location } = useLocationStore.getState();
      expect(location.lat).toBe(37.5);
      expect(location.lng).toBe(127.0);
    });

    it('(0, 0) edge case 정상 처리', () => {
      useLocationStore.getState().setLocation(37.5, 127.0);
      useLocationStore.getState().setLocation(0, 0);
      const { location } = useLocationStore.getState();
      expect(location).toEqual({ lat: 0, lng: 0 });
    });

    it('음수 좌표도 설정 가능', () => {
      useLocationStore.getState().setLocation(-33.8688, 151.2093);
      const { location } = useLocationStore.getState();
      expect(location.lat).toBe(-33.8688);
      expect(location.lng).toBe(151.2093);
    });

    it('좌표를 여러 번 변경할 수 있다', () => {
      useLocationStore.getState().setLocation(37.5665, 126.978);
      useLocationStore.getState().setLocation(35.1796, 129.0756);
      const { location } = useLocationStore.getState();
      expect(location.lat).toBe(35.1796);
      expect(location.lng).toBe(129.0756);
    });
  });

  describe('persist 설정', () => {
    it('persist middleware가 location-storage 키로 설정되어 있다', () => {
      // Zustand persist store는 persist 속성을 가짐
      const store = useLocationStore;
      expect(store.persist).toBeDefined();
      expect(store.persist.getOptions().name).toBe('location-storage');
    });
  });
});
