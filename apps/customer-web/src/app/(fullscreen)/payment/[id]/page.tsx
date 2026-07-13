'use client';

import { TopNavigation } from '@shared/ui/TopNavigation';
import Separator from '@shared/ui/Separator/Separator';
import DeliveryCostInfoDialog from '@features/order/ui/DeliveryCostInfoDialog';
import Loading from '@shared/ui/Loading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getPaymentInfo } from '@features/payment/api/payment';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatNumberWithCommas } from '@shared/lib/format';

export default function PaymentPage({ params }: Readonly<{ params: { id: string } }>) {
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user.accessToken;
  const {
    data: paymentInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['payment', params.id],
    queryFn: () => getPaymentInfo({ orderId: Number(params.id), accessToken }),
  });

  const handleBackClick = () => {
    router.back();
  };

  if (isLoading) return <Loading />;
  if (isError || !paymentInfo) {
    router.push('/error?error=payment_error');
    return;
  }

  return (
    <main className="h-full w-full">
      <div className="flex h-full flex-col justify-between">
        <div>
          <TopNavigation title="영수증" type="back" leftClick={handleBackClick} />
          <section className="space-y-4 p-5">
            <h2 className="text-primary-normal font-headline-1 font-semibold">
              주문 결제 내역이에요
            </h2>
            <div className="font-label-1-normal flex items-center gap-2">
              <p className="text-label-strong font-semibold">
                {format(new Date(paymentInfo.orderedAt), 'yyyy.MM.dd')}
              </p>
              <p className="text-label-alternative font-medium">주문번호 {paymentInfo.id}</p>
            </div>
          </section>
          <Separator variant="horizontal8" />
          <section className="p-5">
            <h3 className="text-static-black font-headline-1 font-semibold">결제 정보</h3>
            <div className="text-label-normal font-body-1-reading mt-6 flex items-center justify-between font-semibold">
              <p className="font-normal">세탁 금액</p>
              <p>{formatNumberWithCommas(paymentInfo.confirmedPayment.charges.laundryPrice)}원</p>
            </div>
            <div className="text-label-alternative font-label-1-normal mt-2 flex justify-between font-medium">
              <p className="font-normal">ㄴ 할인금액</p>
              <p className="font-semibold">0원</p>
            </div>
            <div className="text-label-alternative font-label-1-normal mt-2 flex justify-between font-medium">
              <p className="font-normal">ㄴ 세탁 대행료 10%</p>
              <p className="font-semibold">
                {formatNumberWithCommas(paymentInfo.confirmedPayment.charges.serviceFee)}원
              </p>
            </div>
            {/* TODO: 배송지모달 관련 거리 정보 필요 */}
            <div className="text-label-normal font-body-1-reading mt-3 flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1">
                <p>배송비</p>
                <DeliveryCostInfoDialog distance={1000} />
              </div>
              <p>{formatNumberWithCommas(paymentInfo.confirmedPayment.charges.deliveryFee)}원</p>
            </div>
            <div className="text-label-alternative font-label-1-normal mt-2 flex justify-between font-medium">
              <p className="font-normal">ㄴ 할인금액</p>
              <p className="font-semibold">0원</p>
            </div>
            <Separator variant="horizontal" className="my-5" />
            <div className="flex items-center justify-between font-semibold">
              <p className="text-label-strong font-headline-1">최종 결제 금액</p>
              <p className="text-primary-normal font-heading-2">
                {formatNumberWithCommas(paymentInfo.confirmedPayment.netAmount)}원
              </p>
            </div>
          </section>
          <Separator variant="horizontal8" />
          <section className="p-5">
            <div className="font-body-1-reading flex items-center justify-between font-medium">
              <p className="text-label-alternative">주문일</p>
              <p className="text-label-strong font-semibold">
                {format(new Date(paymentInfo.orderedAt), 'yyyy.MM.dd HH:mm')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
