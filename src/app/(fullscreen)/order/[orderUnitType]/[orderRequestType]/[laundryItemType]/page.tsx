'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getPrices } from '@/api/order';
import LaundryFunnel from '@/components/order/LaundryFunnel';
import Loading from '@/components/share/Loading';
import { LaundryItemType, OrderRequestType, OrderUnitType } from '@/types/laundry-type';

export default function LaundryPage({
  params,
}: Readonly<{
  params: {
    orderUnitType: OrderUnitType;
    orderRequestType: OrderRequestType;
    laundryItemType: LaundryItemType;
  };
}>) {
  const session = useSession();
  const router = useRouter();
  const {
    data: laundryPriceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orderPrices'],
    queryFn: () =>
      getPrices({
        orderUnitType: params.orderUnitType,
        orderRequestType: params.orderRequestType,
        laundryItemType: params.laundryItemType,
      }),
  });

  if (isLoading || session.status === 'loading') return <Loading />;
  if (isError || !laundryPriceData) {
    router.push('/error');
    return;
  }
  return (
    <LaundryFunnel
      laundryItemType={params.laundryItemType}
      orderUnitType={params.orderUnitType}
      orderRequestType={params.orderRequestType}
      laundryPriceData={laundryPriceData}
    />
  );
}
