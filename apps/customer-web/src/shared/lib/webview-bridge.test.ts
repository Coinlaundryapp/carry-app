import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWebView, callBridge, registerCallback } from './webview-bridge';

/* window를 Record로 안전하게 캐스팅하는 헬퍼 */
const win = window as unknown as Record<string, unknown>;

describe('webview-bridge', () => {
  afterEach(() => {
    // AndroidBridge 정리
    delete win.AndroidBridge;
  });

  describe('isWebView', () => {
    it('브라우저 환경에서 AndroidBridge 없으면 false', () => {
      delete win.AndroidBridge;
      expect(isWebView()).toBe(false);
    });

    it('WebView 환경(AndroidBridge 존재)에서 true', () => {
      win.AndroidBridge = { getDeviceInfo: vi.fn() };
      expect(isWebView()).toBe(true);
    });
  });

  describe('callBridge', () => {
    it('bridge 존재 시 action 실행 + 반환값 확인', () => {
      const mockBridge = { getDeviceInfo: vi.fn().mockReturnValue('test-info') };
      win.AndroidBridge = mockBridge;

      const result = callBridge((bridge) => bridge.getDeviceInfo());
      expect(mockBridge.getDeviceInfo).toHaveBeenCalled();
      expect(result).toBe('test-info');
    });

    it('bridge 없을 시 fallback 실행', () => {
      delete win.AndroidBridge;
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
      win.AndroidBridge = mockBridge;

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
      delete win.AndroidBridge;

      const result = callBridge((bridge) => bridge.getDeviceInfo());
      expect(result).toBeUndefined();
    });
  });

  describe('registerCallback', () => {
    it('window에 콜백 등록 확인', () => {
      const callback = vi.fn();
      registerCallback('onNativeBackPressed', callback);

      expect(win.onNativeBackPressed).toBe(callback);

      // 정리
      delete win.onNativeBackPressed;
    });

    it('cleanup 함수 호출 시 window에서 제거 확인', () => {
      const callback = vi.fn();
      const cleanup = registerCallback('onNativeBackPressed', callback);

      expect(win.onNativeBackPressed).toBe(callback);

      cleanup();
      expect(win.onNativeBackPressed).toBeUndefined();
    });

    it('cleanup을 여러 번 호출해도 에러 없음', () => {
      const callback = vi.fn();
      const cleanup = registerCallback('onNativeBackPressed', callback);

      cleanup();
      expect(() => cleanup()).not.toThrow();
    });
  });
});
