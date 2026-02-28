'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { KakaoIcon } from '@assets/icons';
import { useWebView } from '@shared/lib/useWebView';

interface KakaoLoginButtonProps {
  oauthUrl: string;
  /** WebView 로그인 완료 후 리다이렉트 경로 (예: /login-done/payment/123) */
  redirectUrl?: string;
}

/**
 * 카카오 로그인 버튼
 * - 일반 브라우저: OAuth URL로 리다이렉트 (Link 컴포넌트)
 * - WebView: 네이티브에 로그인 처리 위임 → onLoginComplete 콜백으로 토큰 수신 → signIn
 */
export default function KakaoLoginButton({
  oauthUrl,
  redirectUrl = '/login-done',
}: KakaoLoginButtonProps) {
  const { isInWebView, callBridge, registerCallback } = useWebView();
  const router = useRouter();
  const isProcessingRef = useRef(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isInWebView) return;

    const cleanup = registerCallback('onLoginComplete', (accessToken: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsLoggingIn(true);

      void (async () => {
        try {
          const result = await signIn('credentials', {
            kakaoAccessToken: accessToken,
            redirect: false,
          });

          if (result?.error) {
            console.error('[WebViewLogin] signIn failed:', result.error);
            Sentry.captureMessage(`WebView signIn failed: ${result.error}`, 'error');
            router.replace(`/error?error=${encodeURIComponent(result.error)}`);
            return;
          }

          router.replace(redirectUrl);
        } catch (error) {
          console.error('[WebViewLogin] Unexpected error:', error);
          Sentry.captureException(error, { tags: { source: 'webview-login' } });
          router.replace('/error?error=server_error');
        } finally {
          isProcessingRef.current = false;
          setIsLoggingIn(false);
        }
      })();
    });

    return cleanup;
  }, [isInWebView, registerCallback, router, redirectUrl]);

  const handleWebViewLogin = () => {
    if (isLoggingIn) return;

    callBridge(
      (bridge) => bridge.requestLogin(),
      () => {
        // Bridge 호출 실패 시 fallback: 일반 리다이렉트
        window.location.href = oauthUrl;
      },
    );
  };

  if (isInWebView) {
    return (
      <button
        onClick={handleWebViewLogin}
        disabled={isLoggingIn}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold font-body-1-reading disabled:opacity-50"
      >
        <KakaoIcon />
        <p>{isLoggingIn ? '로그인 중...' : '카카오로 시작하기'}</p>
      </button>
    );
  }

  return (
    <Link
      href={oauthUrl}
      className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold font-body-1-reading"
    >
      <KakaoIcon />
      <p>카카오로 시작하기</p>
    </Link>
  );
}
