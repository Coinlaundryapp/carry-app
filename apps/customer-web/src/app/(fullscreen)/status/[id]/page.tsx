'use client';

import Button from '@shared/ui/Button/Button';
import StatusCard from '@features/status/ui/StatusCard';
import { useRouter, useSearchParams } from 'next/navigation';
import OKIcon from '@assets/icons/ok2.svg';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@features/status/api/getOrderDetail';
import { getInvoiceStatus } from '@features/status/api/getInvoiceStatus';
import { toDeliveryProgress, toPaymentBadge } from '@features/status/lib/status-mappers';
import { useSession } from 'next-auth/react';

export default function MyOrderStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const orderId = params.id;

  const session = useSession();
  const accessToken = session.data?.user.accessToken as string;

  const { data: orderDetail } = useQuery({
    queryKey: ['getOrderDetail', orderId],
    queryFn: () => getOrderDetail(accessToken, Number(orderId)),
    enabled: !!accessToken,
  });

  const invoiceQ = useQuery({
    queryKey: ['invoiceStatus', orderId],
    queryFn: () => getInvoiceStatus(accessToken, Number(orderId)),
    enabled: !!accessToken,
    retry: false,
  });
  const badge = toPaymentBadge(invoiceQ.data?.invoice ?? null, invoiceQ.data?.payment ?? null);
  const progress = orderDetail ? toDeliveryProgress(orderDetail.status) : null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center justify-between px-[20px] pb-[30px] pt-[66px]">
      <div className="flex flex-col gap-[40px] self-stretch">
        <div className="flex flex-col items-center gap-[16px] self-stretch">
          <OKIcon />
          <div className="flex flex-col gap-[8px]">
            <p className="font_title_1 text-label-normal text-center font-bold">
              {progress?.label}
            </p>
          </div>
        </div>
        {orderDetail && (
          <StatusCard
            variant="detail"
            orderStatus={orderDetail.status}
            paymentBadge={badge}
            info={orderDetail}
            hasButton={false}
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-[12px]">
        <Button
          state="fillPrimary"
          size="full"
          onClick={() => {
            router.push(`/status/detail/${orderDetail?.id}`);
          }}
        >
          명세서 보기
        </Button>
        <Button
          state="primary"
          size="full"
          onClick={() => {
            router.push('/');
          }}
        >
          홈으로 가기
        </Button>
      </div>
    </div>
  );
}
