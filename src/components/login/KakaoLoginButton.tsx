'use client';

import Link from 'next/link';
import { KakaoIcon } from '@assets/icons';
import { useWebView } from '@/hooks/useWebView';

interface KakaoLoginButtonProps {
  oauthUrl: string;
}

/**
 * 카카오 로그인 버튼
 * - 일반 브라우저: OAuth URL로 리다이렉트
 * - WebView: 네이티브에 로그인 처리 위임 (카카오 앱/Custom Tab)
 */
export default function KakaoLoginButton({ oauthUrl }: KakaoLoginButtonProps) {
  const { isInWebView, callBridge } = useWebView();

  const handleWebViewLogin = () => {
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
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold font-body-1-reading"
      >
        <KakaoIcon />
        <p>카카오로 시작하기</p>
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
