/**
 * 주문 상태 → 한글 라벨.
 *
 * 주문 상태는 **물리 세계의 사실만** 기술한다 — 결제 생애주기(청구·결제·환불)는 Invoice/Payment 소관이다.
 * 백엔드 `OrderStatus`: CREATED / DISPATCHED / PICKED_UP / IN_PROGRESS / COMPLETED / CANCELLED.
 *
 * (과거 판에는 INVOICED·PAYMENT_FAILED·PAID·REFUND_PENDING·REFUNDED 가 섞여 있었는데, 결제·물리 흐름
 * 분리 이후 존재하지 않는 값이라 필터가 빈 결과만 돌려주는 상태였다.)
 */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  CREATED: '생성됨',
  DISPATCHED: '배차됨',
  PICKED_UP: '수거됨',
  IN_PROGRESS: '세탁중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

/** 코디네이터 운영에서 자주 거르는 상태(목록 필터용) — 진행 중 건을 먼저 본다. */
export const ORDER_STATUS_FILTERS = [
  'CREATED',
  'DISPATCHED',
  'PICKED_UP',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

/**
 * 취소 가능 여부 — 종결 상태(완료·취소)만 막는다.
 * 백엔드 규칙과 같다: 코디네이터·시스템은 완료 전까지 취소할 수 있다(`OrderStatus.isCancellableBy`).
 */
export function canCancel(status: string): boolean {
  return !['COMPLETED', 'CANCELLED'].includes(status);
}

/**
 * 취소 시 환불 보상이 일어날 수 있는 상태.
 *
 * 청구서는 **수거 완료 시점**에 발행되고(`InvoiceService.createInvoiceFromPickup`) 자동과금이 뒤따르므로,
 * PICKED_UP 이후 취소는 환불 보상 사가로 이어질 수 있다. 주문 상태만으로는 실제 결제 여부를 알 수 없어
 * 이건 **버튼 문구용 힌트**이고, 환불 여부의 판단은 백엔드가 한다.
 */
export function willRefundOnCancel(status: string): boolean {
  return ['PICKED_UP', 'IN_PROGRESS'].includes(status);
}
