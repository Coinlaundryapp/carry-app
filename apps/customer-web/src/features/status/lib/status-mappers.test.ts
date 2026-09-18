import { describe, it, expect } from 'vitest';
import { toDeliveryProgress, toPaymentBadge } from './status-mappers';

describe('toDeliveryProgress', () => {
  it.each([
    ['CREATED', '수거 대기'],
    ['DISPATCHED', '수거 대기'],
    ['PICKED_UP', '수거 완료'],
    ['IN_PROGRESS', '세탁·배송중'],
    ['COMPLETED', '완료'],
    ['CANCELLED', '취소'],
  ])('%s → %s', (status, label) => {
    expect(toDeliveryProgress(status).label).toBe(label);
  });
  it('모르는 값은 수거 대기로 안전 처리', () => {
    expect(toDeliveryProgress('WEIRD').label).toBe('수거 대기');
  });
  it('CANCELLED → step 0, cancelled true', () => {
    expect(toDeliveryProgress('CANCELLED')).toMatchObject({ step: 0, cancelled: true });
  });
  it('COMPLETED → step 4, cancelled false', () => {
    expect(toDeliveryProgress('COMPLETED')).toMatchObject({ step: 4, cancelled: false });
  });
});

describe('toPaymentBadge', () => {
  it('인보이스 없음 → null(숨김)', () => {
    expect(toPaymentBadge(null, null)).toBeNull();
  });
  it('PAID → 결제 완료', () => {
    expect(
      toPaymentBadge({ status: 'PAID', totalAmount: 24500 } as any, { status: 'COMPLETED' } as any),
    ).toMatchObject({ label: '결제 완료', tone: 'success', amount: 24500 });
  });
  it('FAILED → 결제 실패(배너 대상)', () => {
    expect(toPaymentBadge({ status: 'ISSUED' } as any, { status: 'FAILED' } as any)).toMatchObject({
      label: '결제 실패',
      tone: 'danger',
      needsAction: true,
    });
  });
  it('OVERDUE → 연체(배너 대상)', () => {
    expect(toPaymentBadge({ status: 'OVERDUE' } as any, null)).toMatchObject({
      label: '연체',
      tone: 'danger',
      needsAction: true,
    });
  });
  it('REFUND_PENDING → 환불 처리중', () => {
    expect(
      toPaymentBadge({ status: 'PAID' } as any, { status: 'REFUND_PENDING' } as any),
    ).toMatchObject({ label: '환불 처리중' });
  });
  it('REFUNDED → 환불 완료', () => {
    expect(
      toPaymentBadge({ status: 'REFUNDED' } as any, { status: 'REFUNDED' } as any),
    ).toMatchObject({ label: '환불 완료' });
  });
  it('ISSUED + PENDING → 결제 처리중(fallthrough)', () => {
    expect(toPaymentBadge({ status: 'ISSUED' } as any, { status: 'PENDING' } as any)).toMatchObject(
      { label: '결제 처리중', needsAction: false },
    );
  });
  it('Invoice CANCELLED(미과금 취소) → null(배지 숨김)', () => {
    expect(toPaymentBadge({ status: 'CANCELLED' } as any, null)).toBeNull();
  });
  it('OVERDUE가 FAILED보다 우선 → 연체', () => {
    expect(toPaymentBadge({ status: 'OVERDUE' } as any, { status: 'FAILED' } as any)).toMatchObject(
      { label: '연체', tone: 'danger', needsAction: true },
    );
  });
  it('결제측 REFUNDED(인보이스는 PAID) → 환불 완료', () => {
    expect(toPaymentBadge({ status: 'PAID' } as any, { status: 'REFUNDED' } as any)).toMatchObject({
      label: '환불 완료',
    });
  });
  it('인보이스측 REFUNDED(결제는 COMPLETED) → 환불 완료', () => {
    expect(
      toPaymentBadge({ status: 'REFUNDED' } as any, { status: 'COMPLETED' } as any),
    ).toMatchObject({ label: '환불 완료' });
  });
});
