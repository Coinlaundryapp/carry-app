import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carry — 배달원',
  description: 'Carry 배달원용 웹 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
