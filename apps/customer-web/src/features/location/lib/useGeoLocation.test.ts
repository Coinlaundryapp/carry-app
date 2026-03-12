import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeoLocation } from './useGeoLocation';

// ── Geolocation 모킹 헬퍼 ──

type SuccessCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationPositionError) => void;

function mockGeolocationSuccess(latitude: number, longitude: number) {
  const getCurrentPosition = vi.fn((success: SuccessCallback, _error?: ErrorCallback) => {
    success({
      coords: { latitude, longitude },
    } as GeolocationPosition);
  });

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    writable: true,
    configurable: true,
  });
}

function mockGeolocationError(code: number) {
  const errorNames: Record<number, string> = {
    1: 'PERMISSION_DENIED',
    2: 'POSITION_UNAVAILABLE',
    3: 'TIMEOUT',
  };

  const getCurrentPosition = vi.fn((_success: SuccessCallback, error?: ErrorCallback) => {
    const geoError = {
      code,
      message: errorNames[code] || 'Unknown',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
    error?.(geoError);
  });

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    writable: true,
    configurable: true,
  });
}

describe('useGeoLocation', () => {
  beforeEach(() => {
    // 기본적으로 geolocation을 사용 가능하게 설정
    mockGeolocationSuccess(37.5065, 127.0536);
  });

  it('초기 상태: errorMsg === ""', () => {
    const { result } = renderHook(() => useGeoLocation());
    expect(result.current.errorMsg).toBe('');
  });

  it('getLocation 성공 → { latitude, longitude } 반환', async () => {
    mockGeolocationSuccess(37.5065, 127.0536);
    const { result } = renderHook(() => useGeoLocation());

    let location: { latitude: number; longitude: number } | null = null;
    await act(async () => {
      location = await result.current.getLocation();
    });

    expect(location).toEqual({ latitude: 37.5065, longitude: 127.0536 });
    expect(result.current.errorMsg).toBe('');
  });

  it('PERMISSION_DENIED → errorMsg 설정 + null 반환', async () => {
    mockGeolocationError(1);
    const { result } = renderHook(() => useGeoLocation());

    let location: unknown = 'initial';
    await act(async () => {
      location = await result.current.getLocation();
    });

    expect(location).toBeNull();
    expect(result.current.errorMsg).toContain('거부');
  });

  it('POSITION_UNAVAILABLE → errorMsg 설정 + null 반환', async () => {
    mockGeolocationError(2);
    const { result } = renderHook(() => useGeoLocation());

    let location: unknown = 'initial';
    await act(async () => {
      location = await result.current.getLocation();
    });

    expect(location).toBeNull();
    expect(result.current.errorMsg).toContain('사용할 수 없습니다');
  });

  it('TIMEOUT → errorMsg 설정 + null 반환', async () => {
    mockGeolocationError(3);
    const { result } = renderHook(() => useGeoLocation());

    let location: unknown = 'initial';
    await act(async () => {
      location = await result.current.getLocation();
    });

    expect(location).toBeNull();
    expect(result.current.errorMsg).toContain('시간 초과');
  });

  it('알 수 없는 에러 → 기본 에러 메시지', async () => {
    mockGeolocationError(99);
    const { result } = renderHook(() => useGeoLocation());

    let location: unknown = 'initial';
    await act(async () => {
      location = await result.current.getLocation();
    });

    expect(location).toBeNull();
    expect(result.current.errorMsg).toContain('알 수 없는');
  });
});
