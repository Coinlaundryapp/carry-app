'use client';

import { useRouter } from 'next/navigation';
import AddressField from '@/components/order/AddressField';
import CostField from '@/components/order/CostField';
import LaundryField from '@/components/order/LaundryField';
import PrivacyField from '@/components/order/PrivacyField';
import RequestField from '@/components/order/RequestFiled';
import TimeField from '@/components/order/TimeField';
import Button from '@/components/share/Button';
import Separator from '@/components/share/Separator/Separator';
import { TopNavigation } from '@/components/share/TopNavigation';
import useOrderOptionsStore from '@/store/order-store';

export default function OrderPage() {
  const router = useRouter();
  const { washOptions } = useOrderOptionsStore();
  const handleBackClick = () => {
    router.replace(`/order/${washOptions.laundryType}`);
  };

  return (
    <main>
      <TopNavigation type="back" leftClick={handleBackClick} title="수거 신청" />
      <AddressField key={'123'} addressId={'123'} />
      <Separator variant="horizontal8" />
      <RequestField />
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
