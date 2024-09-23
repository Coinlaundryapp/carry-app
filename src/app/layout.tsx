import type { Metadata } from 'next';
import './globals.css';
import clsx from 'clsx';

import AuthProvider from '@/providers/AuthProvides';
import ReactQueryProviders from '@/hooks/useReactQuery';
import { pretendard } from '@/font/myLocalFont';
import Script from 'next/script';

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
        <ReactQueryProviders>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProviders>
      </body>
    </html>
  );
}
