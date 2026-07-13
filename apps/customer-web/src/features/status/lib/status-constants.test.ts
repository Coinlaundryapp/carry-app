import { describe, it, expect } from 'vitest';
import { ORDER_STATUS, INVOICE_STATUS, PAYMENT_STATUS } from './status-constants';

describe('status-constants', () => {
  it('주문 물리 상태 6종을 정의한다', () => {
    expect(Object.values(ORDER_STATUS)).toEqual([
      'CREATED',
      'DISPATCHED',
      'PICKED_UP',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ]);
  });
  it('인보이스 상태 5종을 정의한다', () => {
    expect(Object.values(INVOICE_STATUS)).toEqual([
      'ISSUED',
      'PAID',
      'OVERDUE',
      'CANCELLED',
      'REFUNDED',
    ]);
  });
  it('결제 상태 5종을 정의한다', () => {
    expect(Object.values(PAYMENT_STATUS)).toEqual([
      'PENDING',
      'COMPLETED',
      'FAILED',
      'REFUND_PENDING',
      'REFUNDED',
    ]);
  });
});
