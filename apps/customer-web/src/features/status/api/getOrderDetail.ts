import type { Schemas } from '@carry/types';
import { OrderDetailRes } from '@shared/types/api-types';
import { LaundryStatusType } from '@features/status/types/laundry-status-type';
import { createV2Client } from '@shared/api/v2-client';

type V2Order = Schemas['OrderResponse'];

/** v2 selectedOptions에서 세탁/건조 세부 옵션을 역추출(생성 시 평탄화의 역). */
function subOption(order: V2Order, optionType: string): string {
  return order.selectedOptions.find((o) => o.optionType === optionType)?.subOptionType ?? '';
}

/**
 * v2 OrderResponse → 앱 OrderDetailRes 매핑(strangler).
 * ⚠️ v2 주문엔 laundromatName·주문단위(orderUnitType)·결제 분해(charges)·배송지 라벨·요청사항이
 * 없어 기본값으로 degrade한다(화면이 읽는 핵심은 id·status·수거일시·세탁소명; 후속 known-debt).
 * 결제 분해는 청구서(M-7 invoice)에 있고 주문 응답엔 totalAmount만 있다.
 */
export function toOrderDetail(order: V2Order): OrderDetailRes {
  return {
    id: order.id,
    status: order.status as LaundryStatusType,
    orderContent: {
      orderUnitType: 'SOLO', // v2 미보유 — PoC 기본
      orderRequestType: 'NEW',
      laundryItemType: order.laundryItemType as OrderDetailRes['orderContent']['laundryItemType'],
      laundrySpecs: [],
      washOption: subOption(order, 'WASH'),
      dryOption: subOption(order, 'DRY'),
      additonalOption: [],
    },
    laundromatName: '', // v2엔 laundromatId만 — 후속 known-debt
    shippingAddress: {
      addressLabel: '',
      recipientPhone: order.recipientPhone,
      recipientName: order.recipientName,
      baseAddress: order.roadAddress,
      detailAddress: order.detailAddress,
      deliveryNotes: '',
      entranceType: '',
      entranceDetail: '',
    },
    orderShedule: {
      desiredPickupDateTime: order.desiredPickupAt,
      desiredDeliveryDate: order.desiredDeliveryAt,
    },
    paymentDetails: {
      estimatedPayment: {
        discounts: { laundryDiscounts: [], deliveryDiscounts: [] },
      },
      charges: { laundryPrice: 0, deliveryFee: 0, serviceFee: 0 },
      netAmount: order.totalAmount ?? 0,
    },
    confirmedPayment: null,
  };
}

export const getOrderDetail = async (
  accessToken: string,
  orderId: number,
): Promise<OrderDetailRes> => {
  const client = createV2Client({ accessToken });
  const order = await client.request<V2Order>(`/api/v2/orders/${orderId}`, {
    method: 'GET',
  });
  return toOrderDetail(order);
};
