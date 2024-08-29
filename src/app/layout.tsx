import type { Metadata } from 'next';
import './globals.css';
import clsx from 'clsx';

import AuthProvider from '@/providers/AuthProvides';
import ReactQueryProviders from '@/hooks/useReactQuery';
import { pretendard } from '@/font/myLocalFont';

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
        <ReactQueryProviders>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProviders>
      </body>
    </html>
  );
}
