'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { getAddress } from '@features/address/api/addressApi';
import useOrderStore from '@features/order/model/order-store';
import { useAddressStore } from '@features/address/model/address-store';
import AddressField from '@features/order/ui/AddressField';
import CostField from '@features/order/ui/CostField';
import LaundryField from '@features/order/ui/LaundryField';
import PrivacyField from '@features/order/ui/PrivacyField';
import TimeField from '@features/order/ui/TimeField';
import OrderSubmitDrawer from '@features/order/ui/OrderSubmitDrawer';

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
    queryKey: ['address', addressId],
    queryFn: () => getAddress(accessToken, addressId as number),
    enabled: !!accessToken && !!addressId,
  });
  const [allConsentsGiven, setAllConsentsGiven] = useState(false);

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      router.push(`/login/${currentUrl}`);
    }
  }, [session.status, router, currentUrl]);
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
  }, [selectedAddressId, setAddressId, addressId]);

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
