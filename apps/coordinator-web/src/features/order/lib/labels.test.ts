import { canCancel, orderStatusLabel, willRefundOnCancel } from './labels';

describe('order labels', () => {
  it('상태를 한글 라벨로 바꾼다', () => {
    expect(orderStatusLabel('PAID')).toBe('결제완료');
    expect(orderStatusLabel('REFUND_PENDING')).toBe('환불대기');
  });

  it('미지정 상태는 원문을 반환한다', () => {
    expect(orderStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('종료된 주문은 취소할 수 없다', () => {
    expect(canCancel('PAID')).toBe(true);
    expect(canCancel('COMPLETED')).toBe(false);
    expect(canCancel('REFUNDED')).toBe(false);
    expect(canCancel('CANCELLED')).toBe(false);
  });

  it('결제 완료 이후 취소는 환불 보상을 부른다', () => {
    expect(willRefundOnCancel('PAID')).toBe(true);
    expect(willRefundOnCancel('IN_PROGRESS')).toBe(true);
    expect(willRefundOnCancel('CREATED')).toBe(false);
  });
});
