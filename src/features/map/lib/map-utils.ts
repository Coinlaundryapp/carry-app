// ── 순수 설정값 생성 유틸 ──
// naver.maps API 없이 테스트 가능한 데이터 조립 함수들

/** 마커 아이콘 설정값 */
export interface MarkerIconOptions {
  content: string;
  size: { w: number; h: number };
  anchor: { x: number; y: number };
}

/** 원(Circle) 설정값 */
export interface CircleConfig {
  center: { lat: number; lng: number };
  radius: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
}

/** 지도 초기 옵션 */
export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  padding: { top: number; bottom: number; left: number; right: number };
  maxZoom: number;
  minZoom: number;
}

// ── 상수 ──

export const DEFAULT_MARKER_SIZE = 32;
export const DEFAULT_CIRCLE_RADIUS = 3000;
export const DEFAULT_ZOOM = 12;
export const MIN_ZOOM = 11;
export const MAX_ZOOM = 17;
export const CIRCLE_STROKE_COLOR = '#00B4B2';
export const CIRCLE_FILL_COLOR = '#ADE4E5';
export const CIRCLE_STROKE_OPACITY = 0.8;
export const CIRCLE_FILL_OPACITY = 0.5;
export const CIRCLE_STROKE_WEIGHT = 2;
export const MAP_PADDING = 10;

// ── 함수 ──

/**
 * 마커 아이콘 설정값 생성
 */
export function createMarkerIconOptions(
  iconHtml: string,
  size: number = DEFAULT_MARKER_SIZE,
): MarkerIconOptions {
  const half = size / 2;
  return {
    content: iconHtml,
    size: { w: size, h: size },
    anchor: { x: half, y: half },
  };
}

/**
 * 원(Circle) 설정값 생성
 */
export function createCircleOptions(
  center: { lat: number; lng: number },
  radius: number = DEFAULT_CIRCLE_RADIUS,
): CircleConfig {
  return {
    center,
    radius,
    strokeColor: CIRCLE_STROKE_COLOR,
    strokeOpacity: CIRCLE_STROKE_OPACITY,
    strokeWeight: CIRCLE_STROKE_WEIGHT,
    fillColor: CIRCLE_FILL_COLOR,
    fillOpacity: CIRCLE_FILL_OPACITY,
  };
}

/**
 * 지도 초기 옵션 생성
 */
export function createMapOptions(
  center: { lat: number; lng: number },
  zoom: number = DEFAULT_ZOOM,
): MapConfig {
  return {
    center,
    zoom,
    padding: {
      top: MAP_PADDING,
      bottom: MAP_PADDING,
      left: MAP_PADDING,
      right: MAP_PADDING,
    },
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
  };
}

/**
 * localStorage에서 좌표 파싱
 * 유효하지 않은 JSON이면 null을 반환 (예외 안전)
 */
export function parseStoredLocation(key: string): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return { lat: parsed.lat, lng: parsed.lng };
    }
    return null;
  } catch {
    return null;
  }
}
