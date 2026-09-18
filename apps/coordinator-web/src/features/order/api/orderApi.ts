import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 주문 코디네이터 API — carry-platform v2(`/api/v2/coordinator/orders`,
 * `@PreAuthorize hasRole('COORDINATOR')`).
 *
 * coordinator-web은 greenfield라 매핑 레이어가 불필요 — `@carry/types`의 `OrderResponse`를
 * 그대로 노출한다. 목록/상세는 소유자 검증 없이 운영자가 전체 주문을 본다(A2 #135).
 *
 * 취소: 결제 완료(PAID 이후) 주문을 취소하면 백엔드가 환불 보상 트랜잭션을 시작한다
 * (OrderCancelledEvent → 결제 사가 markRefundPending → RefundRetrySweeper가 PG 환불).
 */

export type Order = Schemas['OrderResponse'];

function listQuery(status: string | undefined, cursor: number | undefined, size: number): string {
  const q = new URLSearchParams();
  if (status) q.set('status', status);
  if (cursor != null) q.set('cursor', String(cursor));
  q.set('size', String(size));
  return q.toString();
}

/** 주문 목록 — 상태 필터(생략 시 전체). */
export async function getOrders(status?: string, cursor?: number, size = 20): Promise<Order[]> {
  const client = createV2Client();
  const data = await client.request<Order[]>(
    `/api/v2/coordinator/orders?${listQuery(status, cursor, size)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

/** 주문 상세(소유자 검증 없음). */
export async function getOrder(orderId: number): Promise<Order> {
  const client = createV2Client();
  return client.request<Order>(`/api/v2/coordinator/orders/${orderId}`, {
    method: 'GET',
    cache: 'no-cache',
  });
}

/**
 * 주문 취소(코디네이터). 결제 완료 주문이면 환불 보상 사가가 시작된다. 204 No Content.
 */
export async function cancelOrder(orderId: number, reason: string): Promise<void> {
  const client = createV2Client();
  await client.request<void>(`/api/v2/coordinator/orders/${orderId}/cancel`, {
    method: 'POST',
    body: { reason },
  });
}
