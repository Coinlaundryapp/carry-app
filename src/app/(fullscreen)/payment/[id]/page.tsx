'use client';

import { useState } from 'react';
import DeliveryCostInfoDrawer from '@/components/order/DeliveryCostInfoDrawer';
import Button from '@/components/share/Button';
import Dropdown from '@/components/share/Dropdown/Dropdown';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { TopNavigation } from '@/components/share/TopNavigation';

type PaymentMethod = 'kakao' | 'naver' | 'card';

const paymentMethods = [
  {
    label: '카카오페이',
    value: 'kakao',
  },
  {
    label: '네이버페이',
    value: 'naver',
  },
  {
    label: '일반 결제(카드사 앱 결제)',
    value: 'card',
  },
];
const data = [
  {
    value: 'kb',
    label: 'KB국민은행',
  },
];
const data2 = [
  {
    value: '0',
    label: '일시불',
  },
  {
    value: '1',
    label: '1개월',
  },
  {
    value: '2',
    label: '2개월',
  },
  {
    value: '3',
    label: '3개월',
  },
];

type PaymentState = {
  paymentMethod: PaymentMethod;
  card: string;
  installment: string;
};

export default function PaymentPage({ params }: Readonly<{ params: { id: string } }>) {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentMethod: 'kakao',
    card: '',
    installment: '',
  });

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

  const paymentMethods = [
    { value: 'kakao', label: '카카오페이' },
    { value: 'naver', label: '네이버페이' },
    { value: 'card', label: '카드결제' },
  ];

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
            <DeliveryCostInfoDrawer distance={1000} />
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
                data={data}
                value={paymentState.card}
                onChange={handleCardChange}
                placeholder="카드 선택"
                indicator="radio"
                className="mt-3"
              />
              <Dropdown
                data={data2}
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
      <div className="mt-[258px] px-5 pb-[30px]">
        <Button state="fillPrimary" size="full">
          결제하기
        </Button>
      </div>
    </main>
  );
}
