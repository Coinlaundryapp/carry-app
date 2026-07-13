// 백엔드 OrderEnums.kt / PaymentEnums.kt 와 대조해 확정한 값. openapi가 status를 string 으로만
// 노출하므로 앱에서 리터럴을 직접 정의한다.
export const ORDER_STATUS = {
  CREATED: 'CREATED',
  DISPATCHED: 'DISPATCHED',
  PICKED_UP: 'PICKED_UP',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export const INVOICE_STATUS = {
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
