import { fetchExtended } from '@/api/api-client';
import { ApiResponse } from '@/types/api-types';
import { PaymentInfo } from '@/types/payment';

export async function getPaymentInfo({
  orderId,
  accessToken,
}: {
  orderId: number;
  accessToken: string | undefined;
}) {
  // const res = await fetchExtended<ApiResponse<Payment>>(`/api/v1/prices?${orderId.toString()}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   cache: 'no-cache',
  // });
  // return res.body.data;
  // try {
  //   const data: PaymentInfo = {
  //     id: 54,
  //     orderedAt: '2024-09-23T14:35:20Z',
  //     confirmedPayment: {
  //       discounts: {
  //         laundryDiscounts: [],
  //         deliveryDiscounts: [],
  //       },
  //       charges: {
  //         laundryPrice: 10500,
  //         deliveryFee: 4000,
  //         serviceFee: 1050,
  //       },
  //       netAmount: 15500,
  //     },
  //   };
  //   return 1;
  // } catch (error) {
  //   throw new Error('주문을 완료하지 못했습니다.');
  // }

  const data = {
    id: 54, // orderId, 주문 번호
    orderedAt: '2024-09-23T14:35:20Z',
    confirmedPayment: {
      // 최종 금액이 결정된 결제 정보
      discounts: {
        laundryDiscounts: [],
        deliveryDiscounts: [],
      },
      charges: {
        laundryPrice: 10500, // 세탁 가격
        deliveryFee: 4000, // 배송 수수료
        serviceFee: 1050, // 대행 수수료
      },
      netAmount: 15550, // (부과된 요금 총액 - 할인 총액)
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
  try {
    // const res = await fetchExtended<ApiResponse<any>>(`/api/v1/orders/${orderId}/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    //   body: {
    //     orderId,
    //     paymentKey,
    //     amount,
    //   },
    // });
    // return res.body.data;
    const data = {
      id: 435634, // orderId, 주문 번호
      status: 'PAYMENT_COMPLETED', // [Enum] 주문 명세서 상태
      orderUnitType: 'SOLO',
      orderRequestType: 'NEW',
      laundryItemType: 'REGULAR',
      laundromatName: '하늘이 세탁소',
      orderedAt: '2024-09-23T14:35:20Z',
      confirmedAmount: 15500,
    };
    return data;
  } catch (error) {
    throw new Error('결제에 실패하였습니다.');
  }
}
