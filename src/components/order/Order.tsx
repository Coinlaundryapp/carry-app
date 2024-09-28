'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { getAddress } from '@/api/addressApi';
import useOrderStore from '@/store/order-store';
import AddressField from '@/components/order/AddressField';
import CostField from '@/components/order/CostField';
import LaundryField from '@/components/order/LaundryField';
import PrivacyField from '@/components/order/PrivacyField';
import TimeField from '@/components/order/TimeField';
import OrderSubmitDrawer from '@/components/order/OrderSubmitDrawer';
import { useAddressStore } from '@/store/address-store';

export default function Order({
  currentUrl,
}: Readonly<{
  currentUrl: string;
}>) {
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user.accessToken;
  const { selectedAddressId } = useAddressStore();
  const { orderContent, laundryromat, orderSchedule, setOrderSchedule } = useOrderStore();
  const { data: address } = useQuery({
    queryKey: ['address', selectedAddressId],
    queryFn: () => getAddress(accessToken, selectedAddressId as number),
    enabled: !!accessToken && !!selectedAddressId,
  });
  const [allConsentsGiven, setAllConsentsGiven] = useState(false);
  if (session.status === 'unauthenticated') {
    router.push(`/login/${currentUrl}`);
  }
  const canSubmit =
    !orderContent.washOption ||
    !orderContent.orderUnitType ||
    !orderContent.orderRequestType ||
    !orderContent.laundryItemType ||
    !address ||
    !laundryromat ||
    !orderSchedule.desiredDeliveryDateTime ||
    !allConsentsGiven;

  return (
    <div className="h-full bg-white">
      <AddressField address={address} />
      <LaundryField address={address} laundryromat={laundryromat} />
      <TimeField orderSchedule={orderSchedule} setOrderSchedule={setOrderSchedule} />
      <CostField address={address} laundryromat={laundryromat} />
      <PrivacyField
        onAllConsentsGiven={(allConsentsGiven: boolean) => setAllConsentsGiven(allConsentsGiven)}
      />
      <OrderSubmitDrawer canSubmit={canSubmit} />
    </div>
  );
}
