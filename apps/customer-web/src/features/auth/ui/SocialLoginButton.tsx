'use client';

import type { ReactNode } from 'react';
import { signIn } from 'next-auth/react';
import { KakaoIcon } from '@assets/icons';
import type { SocialProvider } from '@features/auth/api/token';

/** 네이버 로고 글리프(초록 배경 위 흰색 N). */
function NaverGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M13.36 10.71 6.42 0H0v20h6.64V9.29L13.58 20H20V0h-6.64v10.71z" fill="#fff" />
    </svg>
  );
}

/** 구글 로고 글리프(4색 G). */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.4 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

/** provider별 NextAuth id(소문자)·라벨·브랜드 스타일·아이콘. */
const PROVIDER_CONFIG: Record<
  SocialProvider,
  { id: string; label: string; className: string; icon: ReactNode }
> = {
  KAKAO: {
    id: 'kakao',
    label: '카카오로 시작하기',
    className: 'bg-[#FEE500]',
    icon: <KakaoIcon />,
  },
  NAVER: {
    id: 'naver',
    label: '네이버로 시작하기',
    className: 'bg-[#03C75A] text-white',
    icon: <NaverGlyph />,
  },
  GOOGLE: {
    id: 'google',
    label: '구글로 시작하기',
    className: 'text-label-strong border-line-normal border bg-white',
    icon: <GoogleGlyph />,
  },
};

interface SocialLoginButtonProps {
  provider: SocialProvider;
  /** OAuth 성공 후 복귀 경로(로그인 딥링크 유지) — 미지정 시 NextAuth 기본값. */
  callbackUrl?: string;
}

/**
 * 브라우저 소셜 로그인 버튼 — 클릭 시 NextAuth `signIn(providerId, { callbackUrl })`로 OAuth 시작.
 * callbackUrl로 원래 요청한 딥링크로 복귀한다. WebView 네이티브 브릿지 흐름은 KakaoLoginButton 담당.
 */
export default function SocialLoginButton({ provider, callbackUrl }: SocialLoginButtonProps) {
  const config = PROVIDER_CONFIG[provider];

  return (
    <button
      type="button"
      onClick={() => void signIn(config.id, callbackUrl ? { callbackUrl } : undefined)}
      className={`font-body-1-reading flex w-full items-center justify-center gap-1 rounded-lg p-4 font-bold ${config.className}`}
    >
      {config.icon}
      <p>{config.label}</p>
    </button>
  );
}
