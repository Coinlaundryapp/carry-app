import { canCancel, orderStatusLabel, willRefundOnCancel } from './labels';

describe('order labels', () => {
  it('상태를 한글 라벨로 바꾼다', () => {
    expect(orderStatusLabel('PICKED_UP')).toBe('수거됨');
    expect(orderStatusLabel('IN_PROGRESS')).toBe('세탁중');
  });

  it('미지정 상태는 원문을 반환한다', () => {
    expect(orderStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('결제 생애주기 상태는 주문 상태가 아니다 - 라벨을 갖지 않는다', () => {
    // 결제·물리 흐름 분리 이후 사라진 값들. 라벨을 다시 넣으면 필터에도 섞여 빈 결과를 부른다.
    for (const gone of ['PAID', 'INVOICED', 'PAYMENT_FAILED', 'REFUND_PENDING', 'REFUNDED']) {
      expect(orderStatusLabel(gone)).toBe(gone);
    }
  });

  it('종료된 주문은 취소할 수 없다', () => {
    expect(canCancel('CREATED')).toBe(true);
    expect(canCancel('PICKED_UP')).toBe(true);
    expect(canCancel('IN_PROGRESS')).toBe(true);
    expect(canCancel('COMPLETED')).toBe(false);
    expect(canCancel('CANCELLED')).toBe(false);
  });

  it('수거 이후 취소는 환불 보상을 부를 수 있다', () => {
    // 청구서는 수거 완료 시 발행되므로 그 이후부터 환불 대상이 생긴다.
    expect(willRefundOnCancel('PICKED_UP')).toBe(true);
    expect(willRefundOnCancel('IN_PROGRESS')).toBe(true);
    expect(willRefundOnCancel('CREATED')).toBe(false);
    expect(willRefundOnCancel('DISPATCHED')).toBe(false);
  });
});
