import { ORDER_STATUS, INVOICE_STATUS, PAYMENT_STATUS } from './status-constants';
import type { Schemas } from '@carry/types';

export type DeliveryProgress = { label: string; step: number; cancelled: boolean };
export type PaymentBadge = {
  label: string;
  tone: 'success' | 'info' | 'danger';
  amount?: number;
  needsAction: boolean;
};

export function toDeliveryProgress(orderStatus: string): DeliveryProgress {
  switch (orderStatus) {
    case ORDER_STATUS.PICKED_UP:
      return { label: '수거 완료', step: 2, cancelled: false };
    case ORDER_STATUS.IN_PROGRESS:
      return { label: '세탁·배송중', step: 3, cancelled: false };
    case ORDER_STATUS.COMPLETED:
      return { label: '완료', step: 4, cancelled: false };
    case ORDER_STATUS.CANCELLED:
      return { label: '취소', step: 0, cancelled: true };
    case ORDER_STATUS.DISPATCHED:
    case ORDER_STATUS.CREATED:
    default:
      return { label: '수거 대기', step: 1, cancelled: false };
  }
}

// invoice 404(수거 전) → 둘 다 null → null 반환(배지 숨김)
export function toPaymentBadge(
  invoice: Pick<Schemas['InvoiceResponse'], 'status' | 'totalAmount'> | null,
  payment: Pick<Schemas['PaymentResponse'], 'status'> | null,
): PaymentBadge | null {
  if (!invoice) return null;
  const inv = invoice.status;
  const pay = payment?.status;
  if (inv === INVOICE_STATUS.REFUNDED || pay === PAYMENT_STATUS.REFUNDED)
    return { label: '환불 완료', tone: 'info', needsAction: false };
  if (pay === PAYMENT_STATUS.REFUND_PENDING)
    return { label: '환불 처리중', tone: 'info', needsAction: false };
  if (inv === INVOICE_STATUS.OVERDUE) return { label: '연체', tone: 'danger', needsAction: true };
  if (pay === PAYMENT_STATUS.FAILED)
    return { label: '결제 실패', tone: 'danger', needsAction: true };
  if (inv === INVOICE_STATUS.PAID || pay === PAYMENT_STATUS.COMPLETED)
    return { label: '결제 완료', tone: 'success', amount: invoice.totalAmount, needsAction: false };
  if (inv === INVOICE_STATUS.CANCELLED) return null; // 미과금 취소 → 배지 없음
  return { label: '결제 처리중', tone: 'info', needsAction: false }; // ISSUED/PENDING 등
}
