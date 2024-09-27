'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AddressField from '@/components/order/AddressField';
import CostField from '@/components/order/CostField';
import LaundryField from '@/components/order/LaundryField';
import PrivacyField from '@/components/order/PrivacyField';
import TimeField from '@/components/order/TimeField';
import Button from '@/components/share/Button';
import useOrderStore from '@/store/order-store';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDefaultAddress } from '@/api/addressApi';
import Loading from '@/components/share/Loading';
import LoadingPage from '@/app/loading';

export default function Order({
  currentUrl,
}: Readonly<{
  currentUrl: string;
}>) {
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user.accessToken;
  const { orderContent, totalAmount, address, setAddress } = useOrderStore();
  const { data: defaultAddress } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: () => getDefaultAddress(accessToken),
    enabled: !!accessToken,
  });
  if (session.status === 'unauthenticated') {
    router.push(`/login/${currentUrl}`);
  }

  useEffect(() => {
    if (defaultAddress && address === null) {
      setAddress(defaultAddress);
    }
  }, [defaultAddress, address, setAddress]);

  return (
    <div className="h-full bg-white">
      <AddressField address={address} />
      <LaundryField address={address} />
      <TimeField />
      <CostField />
      <PrivacyField />
      <div className="sticky bottom-0 w-full bg-white p-6 shadow-emphasize">
        <Button state="fillPrimary" size="full">
          수거 신청하기
        </Button>
      </div>
    </div>
  );
}
