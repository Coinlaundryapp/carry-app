import type { Schemas } from '@carry/types';
import { OrderListRes } from '@shared/types/api-types';
import { createV2Client } from '@shared/api/v2-client';

type V2Order = Schemas['OrderResponse'];

/**
 * v2 OrderResponse → 앱 OrderListRes 매핑(strangler).
 * 목록 화면은 id·status만 읽으며, 나머지(세탁소명·결제 분해·주문단위)는 v2 주문 응답에
 * 없어 기본값으로 둔다(후속 known-debt). OrderResponse에서 totalAmount가 제거돼
 * netAmount는 0으로 두고, 금액은 인보이스 조회로 이관(Task 8).
 */
export function toOrderListItem(order: V2Order): OrderListRes {
  return {
    id: order.id,
    orderedAt: order.createdAt ?? '',
    status: order.status,
    orderContent: {
      orderUnitType: 'SOLO',
      orderRequestType: 'NEW',
      laundryItemType: order.laundryItemType as OrderListRes['orderContent']['laundryItemType'],
    },
    laundromatName: '',
    paymentDetails: {
      estimatedPayment: {
        discounts: { laundryDiscounts: [], deliveryDiscounts: [] },
        charges: { laundryPrice: 0, deliveryFee: 0, serviceFee: 0 },
        // 금액은 인보이스 조회로 이관(Task 8) — 주문 응답엔 더 이상 없음
        netAmount: 0,
      },
    },
    confirmedPayment: null,
  };
}

export const getOrderList = async (
  accessToken: string,
  orderId?: number,
): Promise<OrderListRes[]> => {
  const client = createV2Client({ accessToken });
  const cursor = orderId !== undefined ? `cursor=${orderId}&` : '';
  const data = await client.request<V2Order[]>(`/api/v2/orders/my?${cursor}size=10`, {
    method: 'GET',
  });
  return (data ?? []).map(toOrderListItem);
};
