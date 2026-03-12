import * as Sentry from '@sentry/nextjs';
import type { AndroidBridge } from '@shared/types/webview';

/**
 * WebView 환경 여부를 판별합니다.
 * AndroidBridge 객체가 window에 존재하면 WebView로 판단합니다.
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.AndroidBridge;
}

/**
 * Android JS Bridge를 안전하게 호출합니다.
 * WebView가 아닌 환경(일반 브라우저)에서는 fallback을 실행합니다.
 *
 * @example
 * // WebView에서는 네이티브 브라우저로 열고, 일반 브라우저에서는 새 탭으로 열기
 * callBridge(
 *   (bridge) => bridge.openExternalBrowser(url),
 *   () => window.open(url, '_blank')
 * );
 */
export function callBridge<T>(
  action: (bridge: AndroidBridge) => T,
  fallback?: () => T,
): T | undefined {
  if (isWebView() && window.AndroidBridge) {
    try {
      return action(window.AndroidBridge);
    } catch (error) {
      console.error('[WebViewBridge] Bridge call failed:', error);
      Sentry.captureException(error, { tags: { source: 'webview-bridge' } });
      return fallback?.();
    }
  }
  return fallback?.();
}

/**
 * 네이티브에서 호출할 콜백을 window에 등록합니다.
 * 컴포넌트 언마운트 시 정리할 수 있도록 cleanup 함수를 반환합니다.
 *
 * @example
 * useEffect(() => {
 *   const cleanup = registerCallback('onNativeBackPressed', () => {
 *     router.back();
 *   });
 *   return cleanup;
 * }, []);
 */
export function registerCallback<K extends keyof Omit<Window, keyof WindowEventMap>>(
  name: K,
  callback: NonNullable<Window[K]>,
): () => void {
  if (typeof window === 'undefined') return () => {};

  (window as unknown as Record<string, unknown>)[name as string] = callback;

  return () => {
    delete (window as unknown as Record<string, unknown>)[name as string];
  };
}
