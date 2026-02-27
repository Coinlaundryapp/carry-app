import { fetchExtended } from '@/api/api-client';
import { ApiResponse } from '@/types/api-types';
import { PaymentInfo } from '@/types/payment';

export async function getPaymentInfo({
  orderId,
  accessToken,
}: {
  orderId: number;
  accessToken: string | undefined;
}): Promise<PaymentInfo> {
  // TODO: 백엔드 API 연동 시 아래 주석을 해제하고 목 데이터를 제거하세요
  // const res = await fetchExtended<ApiResponse<PaymentInfo>>(
  //   `/api/v1/orders/${orderId}/payment`,
  //   {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //     cache: 'no-cache',
  //   },
  // );
  // return res.body.data;

  // --- MOCK DATA (백엔드 연동 전까지 사용) ---
  const data: PaymentInfo = {
    id: orderId,
    orderedAt: '2024-09-23T14:35:20Z',
    confirmedPayment: {
      discounts: {
        laundryDiscounts: [],
        deliveryDiscounts: [],
      },
      charges: {
        laundryPrice: 10500,
        deliveryFee: 4000,
        serviceFee: 1050,
      },
      netAmount: 15550,
    },
  };

  return data;
}

export async function postConfirmPayment({
  accessToken,
  orderId,
  paymentKey,
  amount,
}: {
  accessToken: string;
  orderId: number;
  paymentKey: string;
  amount: number;
}) {
  // TODO: 백엔드 API 연동 시 아래 주석을 해제하고 목 데이터를 제거하세요
  // try {
  //   const res = await fetchExtended<ApiResponse<any>>(`/api/v1/orders/${orderId}/payments`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //     body: { orderId, paymentKey, amount },
  //   });
  //   return res.body.data;
  // } catch (error) {
  //   throw new Error('결제에 실패하였습니다.');
  // }

  // --- MOCK DATA (백엔드 연동 전까지 사용) ---
  const data = {
    id: orderId,
    status: 'PAYMENT_COMPLETED',
    orderUnitType: 'SOLO',
    orderRequestType: 'NEW',
    laundryItemType: 'REGULAR',
    laundromatName: '하늘이 세탁소',
    orderedAt: new Date().toISOString(),
    confirmedAmount: amount,
  };
  return data;
}
