'use client';

import Button from '@/components/share/Button/Button';
import StatusCard from '@/components/status/StatusCard';
import { useRouter, useSearchParams } from 'next/navigation';
import OKIcon from '@assets/icons/ok2.svg';
import InfoIcon from '@assets/icons/information-circle-red.svg';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@/api/getOrderDetail';
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

  return (
    <div className="flex h-full w-full flex-col items-center justify-center justify-between px-[20px] pb-[30px] pt-[66px]">
      <div className="flex flex-col gap-[40px] self-stretch">
        <div className="flex flex-col items-center gap-[16px] self-stretch">
          <OKIcon />
          <div className="flex flex-col gap-[8px]">
            <p className="font_title_1 text-center font-bold text-label-normal">
              {orderDetail?.status === 'ORDER_CANCELED' && '주문 취소'}
              {orderDetail?.status === 'ORDER_COMPLETED' && '신청 완료'}
              {orderDetail?.status === 'PAYMENT_COMPLETED' && '결제 완료'}
              {orderDetail?.status === 'REFUND_PENDING' && '환불 대기'}
              {orderDetail?.status === 'REFUND_REQUEST_CANCELED' && '환불 요청 취소'}
            </p>
            <p className="font_body_1 whitespace-pre-line text-center text-label-alternative">
              {orderDetail?.status === 'ORDER_CANCELED' && '주문 취소가 완료되었습니다.'}
              {orderDetail?.status === 'ORDER_COMPLETED' && '시간에 맞춰 세탁물을 내놓아 주세요.'}
              {orderDetail?.status === 'PAYMENT_COMPLETED' && '시간에 맞춰 세탁물을 내놓아 주세요.'}
              {orderDetail?.status === 'REFUND_PENDING' &&
                `영업일 기준 3-5일 이내에 \n 환불이 완료될 예정이에요.`}
            </p>
          </div>
        </div>
        {orderDetail?.status === 'ORDER_COMPLETED' && (
          <div className="flex items-center gap-[12px] rounded-lg bg-[#fff1f0] px-[20px] py-[12px]">
            <InfoIcon width={20} height={20} />
            <p className="font_label_1_reading flex-1 font-semibold">
              세탁 진행 후 결제를 해주셔야 세탁물을 배송해드립니다.
            </p>
          </div>
        )}
        <StatusCard status={orderDetail?.status} info={orderDetail!} hasButton={false} />
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
