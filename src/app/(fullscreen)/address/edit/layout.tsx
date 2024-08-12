'use client';

import { TopNavigation } from '@/components/share/TopNavigation';
import { useRouter } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
 

  const handleBackClick = () => {
   router.push('/');
  };

  return (
    <>
      <TopNavigation type="back" title="배송지 수정" leftClick={handleBackClick} />

      {children}
    </>
  );
}
