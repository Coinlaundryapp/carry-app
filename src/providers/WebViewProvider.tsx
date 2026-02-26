'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isWebView, registerCallback } from '@/lib/webview-bridge';

/**
 * WebView 네이티브 콜백을 전역으로 등록하는 Provider
 * - onNativeBackPressed: Android 하드웨어 백 버튼 → router.back()
 * - onAppResume: 앱 포그라운드 복귀 시 처리
 *
 * 루트 레이아웃에서 한 번만 감싸면 됩니다.
 */
export default function WebViewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isWebView()) return;

    const cleanupBack = registerCallback('onNativeBackPressed', () => {
      router.back();
    });

    const cleanupResume = registerCallback('onAppResume', () => {
      // 앱 복귀 시 필요한 처리 (예: 토큰 갱신, 데이터 리프레시 등)
      router.refresh();
    });

    return () => {
      cleanupBack();
      cleanupResume();
    };
  }, [router]);

  return <>{children}</>;
}
