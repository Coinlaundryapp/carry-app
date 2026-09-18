import type { Metadata, Viewport } from 'next';
import './globals.css';
import clsx from 'clsx';

import AuthProvider from '@shared/providers/AuthProvides';

import { pretendard } from '@/font/myLocalFont';
import Script from 'next/script';
import ReactQueryProviders from '@shared/providers/ReactQueryProviders';
import WebViewProvider from '@shared/providers/WebViewProvider';
import { env } from '@shared/config/env';
import ServiceWorkerRegister from '../shared/pwa/ServiceWorkerRegister';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#13c2c2',
};

export const metadata: Metadata = {
  title: 'Carry',
  description: '세탁 픽업·배송 서비스',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Carry',
  },
  // 아이콘은 App Router 파일 컨벤션으로 제공한다 — app/apple-icon.png(apple-touch-icon),
  // app/favicon.ico(favicon). 파일 컨벤션이 존재하면 metadata.icons는 무시되므로 중복 선언하지 않는다.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={clsx(pretendard.className, 'overflow-hidden bg-black')}>
        <Script
          type="text/javascript"
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${env.NEXT_PUBLIC_NAVER_ID}`}
          strategy="afterInteractive"
        />

        <ServiceWorkerRegister />
        <AuthProvider>
          <ReactQueryProviders>
            <WebViewProvider>{children}</WebViewProvider>
          </ReactQueryProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
