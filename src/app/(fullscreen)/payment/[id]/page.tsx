'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk';
import Button from '@shared/ui/Button';
import Dropdown from '@shared/ui/Dropdown/Dropdown';
import { Radio } from '@shared/ui/Radio';
import Separator from '@shared/ui/Separator/Separator';
import { TopNavigation } from '@shared/ui/TopNavigation';
import DeliveryCostInfoDialog from '@features/order/ui/DeliveryCostInfoDialog';
import Loading from '@shared/ui/Loading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getPaymentInfo } from '@features/payment/api/payment';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatNumberWithCommas } from '@shared/lib/format';
import { isWebView } from '@shared/lib/webview-bridge';
import {
  type PaymentMethod,
  PAYMENT_METHODS,
  CARD_INSTITUTIONS,
  INSTALLMENT_OPTIONS,
} from '@features/payment/lib/constants';

type PaymentState = {
  paymentMethod: PaymentMethod;
  card: string;
  installment: string;
};

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

/**
 * Toss Payments customerKey 생성
 * - 프로덕션에서는 백엔드에서 사용자별 고유 키를 발급받아야 합니다.
 * - 현재는 세션 기반으로 간이 생성합니다.
 */
function generateCustomerKey(sessionId: string): string {
  // TODO: 백엔드 API에서 사용자별 customerKey를 발급받도록 변경
  return `carry_customer_${sessionId}`;
}

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

  const [payment, setPayment] = useState<TossPaymentsPayment | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentMethod: 'KAKAOPAY',
    card: '',
    installment: '',
  });
  const isDisabled =
    paymentState.paymentMethod === 'card' &&
    (paymentState.card === '' || paymentState.installment === '');

  const handleBackClick = () => {
    router.back();
  };

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentState((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleCardChange = (value: string) => {
    setPaymentState((prev) => ({ ...prev, card: value }));
  };

  const handleInstallmentChange = (value: string) => {
    setPaymentState((prev) => ({ ...prev, installment: value }));
  };

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const customerKey = generateCustomerKey(session.data?.user?.accessToken ?? 'anonymous');

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        const payment = tossPayments.payment({
          customerKey,
        });
        // 비회원 결제
        // const payment = tossPayments.payment({ customerKey: ANONYMOUS });

        setPayment(payment);
      } catch (error) {
        console.error('Error fetching payment:', error);
      }
    }

    fetchPayment();
  }, [session.data?.user?.accessToken]);
  if (isLoading) return <Loading />;
  if (isError || !paymentInfo) {
    router.push('/error?error=payment_error');
    return;
  }
  const amount = {
    currency: 'KRW',
    value: paymentInfo.confirmedPayment.netAmount,
  };

  async function requestPayment(paymentState: PaymentState) {
    if (!payment || !paymentInfo) {
      return;
    }

    const successUrl = window.location.origin + '/payment/success';
    const failUrl =
      window.location.origin +
      `/error?error=payment_error&redirectUrl=${window.location.pathname}`;

    // Toss orderId: 주문별 고유 식별자 (영문, 숫자, -, _ 만 허용)
    const tossOrderId = `CARRY_${paymentInfo.id}_${Date.now()}`;
    // TODO: 백엔드에서 주문명(orderName)과 고객 정보를 PaymentInfo에 포함하도록 확장
    const orderName = `캐리 주문 #${paymentInfo.id}`;
    const customerName = session.data?.user?.name ?? '';

    // WebView 환경에서 간편결제(카카오페이/네이버페이) 사용 시,
    // 외부 앱 호출(intent://, kakaotalk:// 등)은 Android 네이티브의
    // shouldOverrideUrlLoading에서 처리해야 합니다.

    try {
      switch (paymentState.paymentMethod) {
        case 'card':
          await payment.requestPayment({
            method: 'CARD',
            amount,
            orderId: tossOrderId,
            orderName,
            successUrl,
            failUrl,
            customerName,
            card: {
              useEscrow: false,
              flowMode: 'DIRECT',
              cardCompany: paymentState.card,
              useCardPoint: false,
              useAppCardOnly: false,
            },
          });
          break;
        case 'KAKAOPAY':
          await payment.requestPayment({
            method: 'CARD',
            amount,
            orderId: tossOrderId,
            orderName,
            successUrl,
            failUrl,
            customerName,
            card: {
              useEscrow: false,
              flowMode: 'DIRECT',
              easyPay: 'KAKAOPAY',
            },
          });
          break;
        case 'NAVERPAY':
          await payment.requestPayment({
            method: 'CARD',
            amount,
            orderId: tossOrderId,
            orderName,
            successUrl,
            failUrl,
            customerName,
            card: {
              flowMode: 'DIRECT',
              easyPay: 'NAVERPAY',
              useCardPoint: false,
              useAppCardOnly: false,
            },
          });
      }
    } catch (error) {
      console.error('[Payment] 결제 요청 실패:', error);

      // WebView에서 외부 앱 호출 실패 시 에러 페이지로 이동
      if (isWebView()) {
        router.push(`/error?error=payment_error&redirectUrl=${window.location.pathname}`);
      }
    }
  }

  return (
    <main className="h-full w-full">
      <div className="flex h-full flex-col justify-between">
        <div>
          <TopNavigation title="결제하기" type="back" leftClick={handleBackClick} />
          <section className="space-y-4 p-5">
            <h2 className="font-semibold text-primary-normal font-headline-1">
              아래에서 결제를 진행해주세요
            </h2>
            <div className="flex items-center gap-2 font-label-1-normal">
              <p className="font-semibold text-label-strong">
                {format(new Date(paymentInfo.orderedAt), 'yyyy.MM.dd')}
              </p>
              <p className="font-medium text-label-alternative">주문번호 {paymentInfo.id}</p>
            </div>
          </section>
          <Separator variant="horizontal8" />
          <section className="p-5">
            <h3 className="font-semibold text-static-black font-headline-1">결제 정보</h3>
            <div className="mt-6 flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
              <p className="font-normal">세탁 금액</p>
              <p>{formatNumberWithCommas(paymentInfo.confirmedPayment.charges.laundryPrice)}원</p>
            </div>
            <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
              <p className="font-normal">ㄴ 할인금액</p>
              <p className="font-semibold">0원</p>
            </div>
            <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
              <p className="font-normal">ㄴ 세탁 대행료 10%</p>
              <p className="font-semibold">
                {formatNumberWithCommas(paymentInfo.confirmedPayment.charges.serviceFee)}원
              </p>
            </div>
            {/* TODO: 배송지모달 관련 거리 정보 필요 */}
            <div className="mt-3 flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
              <div className="flex items-center gap-1">
                <p>배송비</p>
                <DeliveryCostInfoDialog distance={1000} />
              </div>
              <p>{formatNumberWithCommas(paymentInfo.confirmedPayment.charges.deliveryFee)}원</p>
            </div>
            <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
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
            <h2 className="font-semibold text-label-strong font-headline-1">
              결제 수단 <span className="text-status-destructive">*</span>
            </h2>
            <div className="mt-6 flex flex-col font-semibold font-body-2-reading">
              <Radio.Group
                value={paymentState.paymentMethod}
                size="big"
                onChange={(value) => {
                  handlePaymentMethodChange(value as PaymentMethod);
                }}
              >
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center gap-2.5 py-3">
                    <Radio.Button value={method.value} />
                    <p>{method.label}</p>
                  </div>
                ))}
              </Radio.Group>
              {paymentState.paymentMethod === 'card' && (
                <div>
                  <Dropdown
                    data={[...CARD_INSTITUTIONS]}
                    value={paymentState.card}
                    onChange={handleCardChange}
                    placeholder="카드 선택"
                    indicator="radio"
                    className="mt-3"
                  />
                  <Dropdown
                    data={[...INSTALLMENT_OPTIONS]}
                    value={paymentState.installment}
                    onChange={handleInstallmentChange}
                    placeholder="할부 선택"
                    indicator="check"
                    className="mt-3"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="mt-[52px] w-full px-5 pb-[30px]">
          <Button
            state={isDisabled ? 'disabled' : 'fillPrimary'}
            size="full"
            onClick={() => requestPayment(paymentState)}
            disabled={isDisabled}
          >
            결제하기
          </Button>
        </div>
      </div>
    </main>
  );
}
