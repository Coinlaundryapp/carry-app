'use client';

import { useEffect, useState } from 'react';
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
  const { orderContent, addressId, laundromat, orderSchedule, setAddressId, setOrderSchedule } =
    useOrderStore();
  const { data: address } = useQuery({
    queryKey: ['address', selectedAddressId],
    queryFn: () => getAddress(accessToken, selectedAddressId as number),
    enabled: !!accessToken && selectedAddressId !== null,
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
    !addressId ||
    !laundromat ||
    !orderSchedule.desiredDeliveryDateTime ||
    !allConsentsGiven;
  useEffect(() => {
    if (selectedAddressId && addressId === null) {
      setAddressId(selectedAddressId);
    }
  }, [selectedAddressId, setAddressId]);

  return (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <AddressField address={address} />
        <LaundryField address={address} laundromat={laundromat} />
        <TimeField orderSchedule={orderSchedule} setOrderSchedule={setOrderSchedule} />
        <CostField address={address} laundromat={laundromat} />
        <PrivacyField
          onAllConsentsGiven={(allConsentsGiven: boolean) => setAllConsentsGiven(allConsentsGiven)}
        />
      </div>
      <OrderSubmitDrawer canSubmit={canSubmit} />
    </div>
  );
}
