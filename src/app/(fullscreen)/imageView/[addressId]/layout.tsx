'use client';

import { TopNavigation } from '@/components/share/TopNavigation';
import { useRouter } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <>
      <TopNavigation type="back" title="상세 이미지" leftClick={() => router.back()} />
      {children}
    </>
  );
}
