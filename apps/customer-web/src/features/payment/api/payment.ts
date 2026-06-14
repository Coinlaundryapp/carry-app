import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';
import { PaymentInfo } from '@features/payment/types/payment';

/**
 * 결제 API.
 *
 * - [getPaymentInfo] 청구서 조회는 **v2**(`GET /api/v2/payments/{orderId}/invoice`)로 배선.
 * - [postConfirmPayment] 결제 승인은 **실 Toss PG 키가 필요**해 로컬/e2e에서 라이브 검증이
 *   불가하다(브라우저 Kakao OAuth 보류와 같은 클래스). PG 콘솔 준비 전까지 목을 유지한다
 *   (F1 M-7 사용자 결정). 배선 대상은 v2 `POST /api/v2/payments/pay?orderId`
 *   (+Idempotency-Key, body `{pgProvider:'TOSS', paymentKey}`).
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
  // ⚠️ 보류(F1 M-7): 실 Toss paymentKey가 필요해 로컬/e2e 라이브 검증 불가 — PG 콘솔
  //    준비 시 아래로 배선한다(브라우저 Kakao 보류와 동일).
  // const client = createV2Client({ accessToken });
  // return client.request<Schemas['PaymentResponse']>(
  //   `/api/v2/payments/pay?orderId=${orderId}`,
  //   { method: 'POST', idempotencyKey: newIdempotencyKey(), body: { pgProvider: 'TOSS', paymentKey } },
  // );

  // --- MOCK DATA (PG 콘솔 준비 전까지 사용) ---
  const data = {
    id: orderId,
    status: 'PAYMENT_COMPLETED',
    paymentKey,
    confirmedAmount: amount,
  };
  return data;
}
