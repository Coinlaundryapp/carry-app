'use client';

import { useEffect, useState } from 'react';
import { isWebView, callBridge, registerCallback } from '@/lib/webview-bridge';

/**
 * WebView 환경 여부를 반환하는 훅
 * SSR에서는 false, 클라이언트 마운트 후 판별합니다.
 *
 * @example
 * const { isInWebView } = useWebView();
 *
 * // 환경에 따른 분기
 * const handleLogin = () => {
 *   if (isInWebView) {
 *     callBridge((bridge) => bridge.requestLogin());
 *   } else {
 *     router.push(kakaoOAuthUrl);
 *   }
 * };
 */
export function useWebView() {
  const [isInWebView, setIsInWebView] = useState(false);

  useEffect(() => {
    setIsInWebView(isWebView());
  }, []);

  return { isInWebView, callBridge, registerCallback };
}
