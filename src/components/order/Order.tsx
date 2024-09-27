'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AddressField from '@/components/order/AddressField';
import CostField from '@/components/order/CostField';
import LaundryField from '@/components/order/LaundryField';
import PrivacyField from '@/components/order/PrivacyField';
import TimeField from '@/components/order/TimeField';
import Button from '@/components/share/Button';
import Separator from '@/components/share/Separator/Separator';
import useOrderStore from '@/store/order-store';

export default function Order({
  currentUrl,
}: Readonly<{
  currentUrl: string;
}>) {
  const router = useRouter();
  const session = useSession();
  const { orderContent, totalAmount } = useOrderStore();
  if (session.status === 'unauthenticated') {
    router.push(`/login/${currentUrl}`);
  }
  console.log(orderContent, totalAmount);

  return (
    <main className="h-full bg-white">
      <AddressField />
      <Separator variant="horizontal8" />
      <LaundryField />
      <Separator variant="horizontal8" />
      <TimeField />
      <Separator variant="horizontal8" />
      <CostField />
      <Separator variant="horizontal8" />
      <PrivacyField />
      <div className="bg-white p-6 shadow-emphasize">
        <Button state="fillPrimary" size="full">
          수거 신청하기
        </Button>
      </div>
    </main>
  );
}
