'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { KakaoIcon } from '@assets/icons';
import { useWebView } from '@shared/lib/useWebView';
import SocialLoginButton from '@features/auth/ui/SocialLoginButton';

interface KakaoLoginButtonProps {
  /** WebView 로그인 완료 후 리다이렉트 경로 (예: /login-done/payment/123) */
  redirectUrl?: string;
}

/**
 * 카카오 로그인 버튼
 * - 일반 브라우저: NextAuth `signIn('kakao')`로 OAuth 시작 (SocialLoginButton 위임)
 * - WebView: 네이티브에 로그인 처리 위임 → onLoginComplete 콜백으로 토큰 수신 → signIn
 */
export default function KakaoLoginButton({ redirectUrl = '/login-done' }: KakaoLoginButtonProps) {
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
        // Bridge 호출 실패 시 fallback: 브라우저 OAuth(signIn)로 전환.
        void signIn('kakao');
      },
    );
  };

  if (isInWebView) {
    return (
      <button
        onClick={handleWebViewLogin}
        disabled={isLoggingIn}
        className="font-body-1-reading flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold disabled:opacity-50"
      >
        <KakaoIcon />
        <p>{isLoggingIn ? '로그인 중...' : '카카오로 시작하기'}</p>
      </button>
    );
  }

  return <SocialLoginButton provider="KAKAO" callbackUrl={redirectUrl} />;
}
