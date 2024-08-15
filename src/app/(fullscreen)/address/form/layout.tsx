'use client';

import { TopNavigation } from '@/components/share/TopNavigation';
import { useAddressStore } from '@/store/address-store';
import { useRouter } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { addressModalOpen, setAddressModalOpen } = useAddressStore();

  const handleBackClick = () => {
    if (addressModalOpen) {
      setAddressModalOpen(false);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <TopNavigation type="back" title="배송지 추가" leftClick={handleBackClick} />

      {children}
    </>
  );
}
