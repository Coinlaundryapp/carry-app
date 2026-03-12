import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebView } from './useWebView';

// window를 Record로 안전하게 캐스팅
const win = window as unknown as Record<string, unknown>;

describe('useWebView', () => {
  const originalAndroidBridge = win.AndroidBridge;

  beforeEach(() => {
    // 기본: 브라우저 환경 (AndroidBridge 없음)
    delete win.AndroidBridge;
  });

  afterEach(() => {
    if (originalAndroidBridge) {
      win.AndroidBridge = originalAndroidBridge;
    } else {
      delete win.AndroidBridge;
    }
  });

  it('브라우저 환경 (AndroidBridge 없음): isInWebView === false', () => {
    const { result } = renderHook(() => useWebView());
    expect(result.current.isInWebView).toBe(false);
  });

  it('WebView 환경 (AndroidBridge 존재): isInWebView === true', () => {
    win.AndroidBridge = {
      requestLogin: vi.fn(),
      openExternalBrowser: vi.fn(),
    };

    const { result } = renderHook(() => useWebView());
    expect(result.current.isInWebView).toBe(true);
  });

  it('callBridge, registerCallback 함수가 return에 포함됨', () => {
    const { result } = renderHook(() => useWebView());

    expect(typeof result.current.callBridge).toBe('function');
    expect(typeof result.current.registerCallback).toBe('function');
  });

  it('마운트 후 상태 변경 확인 (useEffect 동작)', () => {
    // 먼저 브라우저 환경에서 렌더
    const { result, rerender } = renderHook(() => useWebView());
    expect(result.current.isInWebView).toBe(false);

    // AndroidBridge를 주입하고 리렌더
    win.AndroidBridge = {
      requestLogin: vi.fn(),
      openExternalBrowser: vi.fn(),
    };

    rerender();
    // useEffect의 의존성 배열이 []이므로 rerender만으로는 상태가 바뀌지 않음.
    // 이는 useWebView의 설계 의도: 마운트 시점에 한 번만 판별
    // → 새로운 renderHook에서 확인
    const { result: result2 } = renderHook(() => useWebView());
    expect(result2.current.isInWebView).toBe(true);
  });
});
