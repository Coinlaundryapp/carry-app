import type { Metadata, Viewport } from 'next';
import './globals.css';
import clsx from 'clsx';

import AuthProvider from '@/providers/AuthProvides';

import { pretendard } from '@/font/myLocalFont';
import Script from 'next/script';
import ReactQueryProviders from '@/providers/ReactQueryProviders';
import WebViewProvider from '@/providers/WebViewProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Carry',
  description: 'Carry',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(pretendard.className, 'overflow-hidden bg-black')}>
        <Script
          type="text/javascript"
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_ID}`}
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <ReactQueryProviders>
            <WebViewProvider>{children}</WebViewProvider>
          </ReactQueryProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
