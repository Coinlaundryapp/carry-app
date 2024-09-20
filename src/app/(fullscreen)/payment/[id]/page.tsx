'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk';
import Button from '@/components/share/Button';
import Dropdown from '@/components/share/Dropdown/Dropdown';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { TopNavigation } from '@/components/share/TopNavigation';
import DeliveryCostInfoDialog from '@/components/order/DeliveryCostInfoDialog';

type PaymentMethod = 'KAKAOPAY' | 'NAVERPAY' | 'card';

const paymentMethods = [
  {
    label: '카카오페이',
    value: 'KAKAOPAY',
  },
  {
    label: '네이버페이',
    value: 'NAVERPAY',
  },
  {
    label: '일반 결제(카드사 앱 결제)',
    value: 'card',
  },
];
const institutions = [
  { label: '기업 BC', value: 'IBK_BC' },
  { label: '광주은행', value: 'GWANGJUBANK' },
  { label: '롯데카드', value: 'LOTTE' },
  { label: 'KDB산업은행', value: 'KDBBANK' },
  { label: 'BC카드', value: 'BC' },
  { label: '삼성카드', value: 'SAMSUNG' },
  { label: '새마을금고', value: 'SAEMAUL' },
  { label: '신한카드', value: 'SHINHAN' },
  { label: '신협', value: 'SHINHYEOP' },
  { label: '씨티카드', value: 'CITI' },
  { label: '우리카드', value: 'WOORI' },
  { label: '우체국예금보험', value: 'POST' },
  { label: '저축은행중앙회', value: 'SAVINGBANK' },
  { label: '전북은행', value: 'JEONBUKBANK' },
  { label: '제주은행', value: 'JEJUBANK' },
  { label: '카카오뱅크', value: 'KAKAOBANK' },
  { label: '케이뱅크', value: 'KBANK' },
  { label: '토스뱅크', value: 'TOSSBANK' },
  { label: '하나카드', value: 'HANA' },
  { label: '현대카드', value: 'HYUNDAI' },
  { label: 'KB국민카드', value: 'KOOKMIN' },
  { label: 'NH농협카드', value: 'NONGHYEOP' },
  { label: 'Sh수협은행', value: 'SUHYEOP' },
  { label: '페이코', value: 'PCP' },
  { label: 'KB증권', value: 'KBS' },
];
const installmentData = [
  { value: '0', label: '일시불' },
  { value: '2', label: '2개월' },
  { value: '3', label: '3개월' },
  { value: '4', label: '4개월' },
  { value: '5', label: '5개월' },
  { value: '6', label: '6개월' },
  { value: '7', label: '7개월' },
  { value: '8', label: '8개월' },
  { value: '9', label: '9개월' },
  { value: '10', label: '10개월' },
  { value: '11', label: '11개월' },
  { value: '12', label: '12개월' },
];

type PaymentState = {
  paymentMethod: PaymentMethod;
  card: string;
  installment: string;
};
const amount = {
  currency: 'KRW',
  value: 50000,
};

const clientKey = 'test_ck_LkKEypNArW1B7K0Em51A3lmeaxYG';
const customerKey = 'dr09G1bpeUIgkygKX5L4H';

export default function PaymentPage({ params }: Readonly<{ params: { id: string } }>) {
  const [payment, setPayment] = useState<TossPaymentsPayment | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentMethod: 'KAKAOPAY',
    card: '',
    installment: '',
  });
  const isDisabled =
    paymentState.paymentMethod === 'card' &&
    (paymentState.card === '' || paymentState.installment === '');

  // TODO: 뒤로가기 동작 정의
  const handleBackClick = () => {};

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentState((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleCardChange = (value: string) => {
    setPaymentState((prev) => ({ ...prev, card: value }));
  };

  const handleInstallmentChange = (value: string) => {
    setPaymentState((prev) => ({ ...prev, installment: value }));
  };

  async function requestPayment(paymentState: PaymentState) {
    if (!payment) {
      return;
    }
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    switch (paymentState.paymentMethod) {
      case 'card':
        await payment.requestPayment({
          method: 'CARD', // 카드 및 간편결제
          amount,
          orderId: 'NefN2Hu0HsStnHO2prILj',
          orderName: '토스 티셔츠 외 2건',
          successUrl: window.location.origin + window.location.pathname + '/success',
          failUrl: window.location.origin + '/error', // 결제 요청이 실패하면 리다이렉트되는 URL
          customerEmail: 'customer123@gmail.com',
          customerName: '김토스',
          customerMobilePhone: '01012345678',
          card: {
            useEscrow: false,
            flowMode: 'DIRECT', // 자체창 여는 옵션
            cardCompany: paymentState.card,
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
        break;
      case 'KAKAOPAY':
        await payment.requestPayment({
          method: 'CARD', // 카드 및 간편결제
          amount: {
            currency: 'KRW',
            value: 50000,
          },
          orderId: 'NefN2Hu0HsStnHO2prILj', // 고유 주분번호
          orderName: '토스 티셔츠 외 2건',
          successUrl: window.location.origin + window.location.pathname + '/success',
          failUrl: window.location.origin + window.location.pathname,
          customerEmail: 'customer123@gmail.com',
          customerName: '김토스',
          customerMobilePhone: '01012341234',
          // 카드 결제에 필요한 정보
          card: {
            useEscrow: false,
            flowMode: 'DIRECT', // 자체창 여는 옵션
            easyPay: 'KAKAOPAY', // 간편결제 자체창
          },
        });
        break;
      case 'NAVERPAY':
        await payment.requestPayment({
          method: 'CARD', // 카드 및 간편결제
          amount: {
            currency: 'KRW',
            value: 50000,
          },
          orderId: 'NefN2Hu0HsStnHO2prILj', // 고유 주분번호
          orderName: '토스 티셔츠 외 2건',
          successUrl: window.location.origin + window.location.pathname + '/success',
          //현재 위치로
          failUrl: window.location.origin + window.location.pathname,
          customerEmail: 'customer123@gmail.com',
          customerName: '김토스',
          customerMobilePhone: '01012341234',
          // 카드 결제에 필요한 정보
          card: {
            flowMode: 'DIRECT', // 자체창 여는 옵션
            easyPay: 'NAVERPAY', // 간편결제 자체창
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
    }
  }
  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

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
  }, [clientKey, customerKey]);

  return (
    <main>
      <TopNavigation title="결제하기" type="back" leftClick={handleBackClick} />
      <section className="space-y-4 p-5">
        <h2 className="font-semibold text-primary-normal font-headline-1">
          아래에서 결제를 진행해주세요
        </h2>
        <div className="flex items-center gap-2 font-label-1-normal">
          <p className="font-semibold text-label-strong">2024.06.06</p>
          <p className="font-medium text-label-alternative">주문번호 0921039123</p>
        </div>
      </section>
      <Separator variant="horizontal8" />
      <section className="p-5">
        <h3 className="font-semibold text-static-black font-headline-1">결제 정보</h3>
        <div className="mt-6 flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
          <p className="font-normal">세탁 금액</p>
          <p>4,000원</p>
        </div>
        <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
          <p className="font-normal">ㄴ 할인금액</p>
          <p className="font-semibold">0원</p>
        </div>
        <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
          <p className="font-normal">ㄴ 세탁 대행료 10%</p>
          <p className="font-semibold">1,050원</p>
        </div>
        <div className="mt-3 flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
          <div className="flex items-center gap-1">
            <p>배송비</p>
            <DeliveryCostInfoDialog distance={1000} />
          </div>
          <p>4,000원</p>
        </div>
        <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
          <p className="font-normal">ㄴ 할인금액</p>
          <p className="font-semibold">0원</p>
        </div>
        <Separator variant="horizontal" className="my-5" />
        <div className="flex items-center justify-between font-semibold">
          <p className="text-label-strong font-headline-1">최종 결제 금액</p>
          <p className="text-primary-normal font-heading-2">14,550원</p>
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
            {paymentMethods.map((method) => (
              <div key={method.value} className="flex items-center gap-2.5 py-3">
                <Radio.Button value={method.value} />
                <p>{method.label}</p>
              </div>
            ))}
          </Radio.Group>
          {paymentState.paymentMethod === 'card' && (
            <div>
              <Dropdown
                data={institutions}
                value={paymentState.card}
                onChange={handleCardChange}
                placeholder="카드 선택"
                indicator="radio"
                className="mt-3"
              />
              <Dropdown
                data={installmentData}
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
      <div className="mt-[52px] px-5 pb-[30px]">
        <Button
          state={isDisabled ? 'disabled' : 'fillPrimary'}
          size="full"
          onClick={() => requestPayment(paymentState)}
          disabled={isDisabled}
        >
          결제하기
        </Button>
      </div>
    </main>
  );
}
