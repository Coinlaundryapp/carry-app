import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';
import { PaymentInfo } from '@features/payment/types/payment';

/**
 * 결제 API.
 *
 * - [getPaymentInfo] 청구서 조회는 **v2**(`GET /api/v2/payments/{orderId}/invoice`)로 배선.
 * - 자동결제(빌링키) 전환으로 수동 결제 승인(postConfirmPayment)은 제거됨. 결제는
 *   백엔드 사가가 등록된 빌링키로 처리하며, `/payment/[id]`는 조회 전용 영수증이다.
 */

type V2Invoice = Schemas['InvoiceResponse'];

/** 청구서 항목 금액을 요금 유형(백엔드 ChargeType.name)으로 찾는다. */
function chargeAmount(lineItems: V2Invoice['lineItems'], chargeType: string): number {
  return lineItems.find((item) => item.chargeType === chargeType)?.amount ?? 0;
}

/**
 * v2 InvoiceResponse → 앱 PaymentInfo 매핑(strangler).
 * lineItems를 요금 유형(LAUNDRY_PRICE·DELIVERY_FEE·SERVICE_FEE)으로 버킷팅한다.
 * ⚠️ v2 청구서엔 할인(discounts) 표면이 없어 빈 배열로 둔다(후속 known-debt).
 */
function toPaymentInfo(invoice: V2Invoice): PaymentInfo {
  return {
    id: invoice.orderId,
    orderedAt: invoice.createdAt,
    confirmedPayment: {
      discounts: {
        laundryDiscounts: [],
        deliveryDiscounts: [],
      },
      charges: {
        laundryPrice: chargeAmount(invoice.lineItems, 'LAUNDRY_PRICE'),
        deliveryFee: chargeAmount(invoice.lineItems, 'DELIVERY_FEE'),
        serviceFee: chargeAmount(invoice.lineItems, 'SERVICE_FEE'),
      },
      netAmount: invoice.totalAmount,
    },
  };
}

export async function getPaymentInfo({
  orderId,
  accessToken,
}: {
  orderId: number;
  accessToken: string | undefined;
}): Promise<PaymentInfo> {
  const client = createV2Client({ accessToken });
  const invoice = await client.request<V2Invoice>(`/api/v2/payments/${orderId}/invoice`, {
    method: 'GET',
    cache: 'no-cache',
  });
  return toPaymentInfo(invoice);
}
