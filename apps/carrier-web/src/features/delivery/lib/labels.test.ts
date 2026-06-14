import { deliveryStatusLabel, nextAction } from './labels';

describe('delivery labels', () => {
  it('상태를 한글 라벨로 바꾼다', () => {
    expect(deliveryStatusLabel('PICKUP_PENDING')).toBe('수거 대기');
    expect(deliveryStatusLabel('DELIVERED')).toBe('배달 완료');
    expect(deliveryStatusLabel('WEIRD')).toBe('WEIRD');
  });

  it('상태기계의 다음 액션을 매핑한다', () => {
    expect(nextAction('PICKUP_PENDING')).toEqual({
      kind: 'pickup',
      label: '수거 완료',
      needsWeight: true,
    });
    expect(nextAction('PICKED_UP')?.kind).toBe('washing');
    expect(nextAction('IN_LAUNDRY')?.kind).toBe('drying');
    expect(nextAction('LAUNDRY_COMPLETE')?.kind).toBe('delivery');
    expect(nextAction('DELIVERY_PENDING')?.kind).toBe('delivery');
  });

  it('완료/취소 상태는 다음 액션이 없다', () => {
    expect(nextAction('DELIVERED')).toBeNull();
    expect(nextAction('CANCELLED')).toBeNull();
  });

  it('pickup만 무게 입력이 필요하다', () => {
    expect(nextAction('PICKUP_PENDING')?.needsWeight).toBe(true);
    expect(nextAction('PICKED_UP')?.needsWeight).toBe(false);
  });
});
