/**
 * 주문 생성(v2 createOrder) 409 응답의 `ApiError.code` 상수.
 * 백엔드 billing-key 재설계와 동기화 — 제출 플로우(F6)가 이 코드로 분기한다.
 */
export const ORDER_ERROR_CODE = {
  BILLING_KEY_REQUIRED: 'BILLING_KEY_REQUIRED',
  OVERDUE_INVOICE_EXISTS: 'OVERDUE_INVOICE_EXISTS',
} as const;
