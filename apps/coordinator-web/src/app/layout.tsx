import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carry — 코디네이터',
  description: 'Carry 코디네이터용 웹 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
