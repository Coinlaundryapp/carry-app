import type { Schemas } from '@carry/types';
import { ApiError } from '@carry/api';
import { createV2Client } from '@shared/api/v2-client';

export type InvoiceStatusInfo = {
  invoice: Pick<Schemas['InvoiceResponse'], 'status' | 'totalAmount'> | null;
  payment: Pick<Schemas['PaymentResponse'], 'status'> | null;
};

async function getOr404Null<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/**
 * 주문 상세 화면 전용: 청구서(invoice)와 결제(payment)를 병렬 조회한다.
 * 수거 전(청구서 미발행) 등 404는 정상 상태로 간주해 null로 degrade한다(throw 아님).
 * ⚠️ 목록 화면에서는 호출 금지 — 주문 개수만큼 N+1 조회가 발생한다.
 */
export async function getInvoiceStatus(
  accessToken: string,
  orderId: number,
): Promise<InvoiceStatusInfo> {
  const client = createV2Client({ accessToken });
  const [invoice, payment] = await Promise.all([
    getOr404Null(() =>
      client.request<Schemas['InvoiceResponse']>(`/api/v2/payments/${orderId}/invoice`, {
        method: 'GET',
        cache: 'no-cache',
      }),
    ),
    getOr404Null(() =>
      client.request<Schemas['PaymentResponse']>(`/api/v2/payments/${orderId}/payment`, {
        method: 'GET',
        cache: 'no-cache',
      }),
    ),
  ]);
  return {
    invoice: invoice ? { status: invoice.status, totalAmount: invoice.totalAmount } : null,
    payment: payment ? { status: payment.status } : null,
  };
}
