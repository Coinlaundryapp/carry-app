/**
 * 주문 상태 → 한글 라벨.
 * OrderStatus: CREATED/DISPATCHED/PICKED_UP/INVOICED/PAYMENT_FAILED/PAID/
 *              IN_PROGRESS/COMPLETED/REFUND_PENDING/REFUNDED/CANCELLED
 */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  CREATED: '생성됨',
  DISPATCHED: '배차됨',
  PICKED_UP: '수거됨',
  INVOICED: '청구됨',
  PAYMENT_FAILED: '결제실패',
  PAID: '결제완료',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
  REFUND_PENDING: '환불대기',
  REFUNDED: '환불완료',
  CANCELLED: '취소됨',
};

/** 코디네이터 운영에서 자주 거르는 상태(목록 필터용). */
export const ORDER_STATUS_FILTERS = [
  'PAID',
  'IN_PROGRESS',
  'INVOICED',
  'REFUND_PENDING',
  'REFUNDED',
  'CANCELLED',
] as const;

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

/**
 * 취소 가능 여부 — 이미 종료(완료·환불·취소)된 주문은 취소할 수 없다.
 * 결제 완료(PAID 이후) 주문 취소는 백엔드에서 환불 보상 사가로 이어진다.
 */
export function canCancel(status: string): boolean {
  return !['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(status);
}

/** 취소 시 환불 보상이 일어나는 상태(결제 완료 이후). */
export function willRefundOnCancel(status: string): boolean {
  return ['PAID', 'IN_PROGRESS', 'REFUND_PENDING'].includes(status);
}
