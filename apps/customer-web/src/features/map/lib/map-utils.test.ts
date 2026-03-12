import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMarkerIconOptions,
  createCircleOptions,
  createMapOptions,
  parseStoredLocation,
  DEFAULT_MARKER_SIZE,
  DEFAULT_CIRCLE_RADIUS,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  CIRCLE_STROKE_COLOR,
  CIRCLE_FILL_COLOR,
  CIRCLE_STROKE_OPACITY,
  CIRCLE_FILL_OPACITY,
  MAP_PADDING,
} from './map-utils';

describe('map-utils', () => {
  describe('createMarkerIconOptions', () => {
    it('기본 사이즈 32x32, anchor 16x16', () => {
      const result = createMarkerIconOptions('<div>marker</div>');
      expect(result.size).toEqual({ w: DEFAULT_MARKER_SIZE, h: DEFAULT_MARKER_SIZE });
      expect(result.anchor).toEqual({ x: 16, y: 16 });
      expect(result.content).toBe('<div>marker</div>');
    });

    it('커스텀 사이즈 적용 확인', () => {
      const result = createMarkerIconOptions('<div>big</div>', 48);
      expect(result.size).toEqual({ w: 48, h: 48 });
      expect(result.anchor).toEqual({ x: 24, y: 24 });
    });

    it('anchor는 항상 size의 절반', () => {
      const result = createMarkerIconOptions('<div>odd</div>', 50);
      expect(result.anchor).toEqual({ x: 25, y: 25 });
    });
  });

  describe('createCircleOptions', () => {
    const center = { lat: 37.5665, lng: 126.978 };

    it('기본 반경 3000', () => {
      const result = createCircleOptions(center);
      expect(result.radius).toBe(DEFAULT_CIRCLE_RADIUS);
    });

    it("strokeColor '#00B4B2'", () => {
      const result = createCircleOptions(center);
      expect(result.strokeColor).toBe(CIRCLE_STROKE_COLOR);
    });

    it('strokeOpacity 0.8, fillOpacity 0.5', () => {
      const result = createCircleOptions(center);
      expect(result.strokeOpacity).toBe(CIRCLE_STROKE_OPACITY);
      expect(result.fillOpacity).toBe(CIRCLE_FILL_OPACITY);
    });

    it('fillColor 확인', () => {
      const result = createCircleOptions(center);
      expect(result.fillColor).toBe(CIRCLE_FILL_COLOR);
    });

    it('center 좌표 그대로 반환', () => {
      const result = createCircleOptions(center);
      expect(result.center).toEqual(center);
    });

    it('커스텀 반경 적용', () => {
      const result = createCircleOptions(center, 5000);
      expect(result.radius).toBe(5000);
    });
  });

  describe('createMapOptions', () => {
    const center = { lat: 37.5665, lng: 126.978 };

    it('기본 zoom 12', () => {
      const result = createMapOptions(center);
      expect(result.zoom).toBe(DEFAULT_ZOOM);
    });

    it('min/max zoom 범위', () => {
      const result = createMapOptions(center);
      expect(result.minZoom).toBe(MIN_ZOOM);
      expect(result.maxZoom).toBe(MAX_ZOOM);
    });

    it('padding 값 확인', () => {
      const result = createMapOptions(center);
      expect(result.padding).toEqual({
        top: MAP_PADDING,
        bottom: MAP_PADDING,
        left: MAP_PADDING,
        right: MAP_PADDING,
      });
    });

    it('커스텀 zoom 적용', () => {
      const result = createMapOptions(center, 15);
      expect(result.zoom).toBe(15);
    });

    it('center 좌표 그대로 반환', () => {
      const result = createMapOptions(center);
      expect(result.center).toEqual(center);
    });
  });

  describe('parseStoredLocation', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('유효한 JSON → 좌표 객체 반환', () => {
      localStorage.setItem('testKey', JSON.stringify({ lat: 37.5, lng: 127.0 }));
      const result = parseStoredLocation('testKey');
      expect(result).toEqual({ lat: 37.5, lng: 127.0 });
    });

    it('키 없음 → null', () => {
      const result = parseStoredLocation('nonExistentKey');
      expect(result).toBeNull();
    });

    it('잘못된 JSON → null (예외 안전)', () => {
      localStorage.setItem('badJson', '{invalid json}');
      const result = parseStoredLocation('badJson');
      expect(result).toBeNull();
    });

    it('lat/lng가 숫자가 아닌 경우 → null', () => {
      localStorage.setItem('badCoords', JSON.stringify({ lat: 'abc', lng: 'def' }));
      const result = parseStoredLocation('badCoords');
      expect(result).toBeNull();
    });

    it('빈 객체 → null', () => {
      localStorage.setItem('empty', JSON.stringify({}));
      const result = parseStoredLocation('empty');
      expect(result).toBeNull();
    });
  });
});
