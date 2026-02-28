import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebView, callBridge, registerCallback } from './webview-bridge';

describe('webview-bridge', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    // AndroidBridge 정리
    if (typeof window !== 'undefined') {
      delete (window as Record<string, unknown>).AndroidBridge;
    }
  });

  describe('isWebView', () => {
    it('브라우저 환경에서 AndroidBridge 없으면 false', () => {
      delete (window as Record<string, unknown>).AndroidBridge;
      expect(isWebView()).toBe(false);
    });

    it('WebView 환경(AndroidBridge 존재)에서 true', () => {
      (window as Record<string, unknown>).AndroidBridge = {
        getDeviceInfo: vi.fn(),
      };
      expect(isWebView()).toBe(true);
    });
  });

  describe('callBridge', () => {
    it('bridge 존재 시 action 실행 + 반환값 확인', () => {
      const mockBridge = { getDeviceInfo: vi.fn().mockReturnValue('test-info') };
      (window as Record<string, unknown>).AndroidBridge = mockBridge;

      const result = callBridge((bridge) => bridge.getDeviceInfo());
      expect(mockBridge.getDeviceInfo).toHaveBeenCalled();
      expect(result).toBe('test-info');
    });

    it('bridge 없을 시 fallback 실행', () => {
      delete (window as Record<string, unknown>).AndroidBridge;
      const fallback = vi.fn().mockReturnValue('fallback-value');

      const result = callBridge((bridge) => bridge.getDeviceInfo(), fallback);
      expect(fallback).toHaveBeenCalled();
      expect(result).toBe('fallback-value');
    });

    it('bridge 호출 중 예외 발생 시 fallback으로 graceful degradation', () => {
      const mockBridge = {
        getDeviceInfo: vi.fn().mockImplementation(() => {
          throw new Error('Bridge error');
        }),
      };
      (window as Record<string, unknown>).AndroidBridge = mockBridge;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const fallback = vi.fn().mockReturnValue('recovered');

      const result = callBridge((bridge) => bridge.getDeviceInfo(), fallback);
      expect(fallback).toHaveBeenCalled();
      expect(result).toBe('recovered');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[WebViewBridge] Bridge call failed:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('fallback도 없을 시 undefined 반환', () => {
      delete (window as Record<string, unknown>).AndroidBridge;

      const result = callBridge((bridge) => bridge.getDeviceInfo());
      expect(result).toBeUndefined();
    });
  });

  describe('registerCallback', () => {
    it('window에 콜백 등록 확인', () => {
      const callback = vi.fn();
      registerCallback('onNativeBackPressed' as keyof Window, callback as never);

      expect((window as Record<string, unknown>).onNativeBackPressed).toBe(callback);

      // 정리
      delete (window as Record<string, unknown>).onNativeBackPressed;
    });

    it('cleanup 함수 호출 시 window에서 제거 확인', () => {
      const callback = vi.fn();
      const cleanup = registerCallback('onNativeBackPressed' as keyof Window, callback as never);

      expect((window as Record<string, unknown>).onNativeBackPressed).toBe(callback);

      cleanup();
      expect((window as Record<string, unknown>).onNativeBackPressed).toBeUndefined();
    });

    it('cleanup을 여러 번 호출해도 에러 없음', () => {
      const callback = vi.fn();
      const cleanup = registerCallback('onNativeBackPressed' as keyof Window, callback as never);

      cleanup();
      expect(() => cleanup()).not.toThrow();
    });
  });
});
