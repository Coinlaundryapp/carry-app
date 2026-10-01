import { deliveryStatusLabel, nextAction } from './labels';

describe('delivery labels', () => {
  it('상태를 한글 라벨로 바꾼다', () => {
    expect(deliveryStatusLabel('PICKUP_PENDING')).toBe('수거 대기');
    expect(deliveryStatusLabel('DELIVERY_PENDING')).toBe('배달 중');
    expect(deliveryStatusLabel('DELIVERED')).toBe('배달 완료');
    expect(deliveryStatusLabel('WEIRD')).toBe('WEIRD');
  });

  it('상태기계의 다음 액션을 매핑한다', () => {
    expect(nextAction('PICKUP_PENDING')).toEqual({
      kind: 'pickup',
      label: '수거 완료',
      needsWeight: true,
      needsPhotos: true,
    });
    expect(nextAction('PICKED_UP')?.kind).toBe('washing');
    expect(nextAction('IN_LAUNDRY')?.kind).toBe('drying');
    // 백엔드 상태기계는 LAUNDRY_COMPLETE → DELIVERY_PENDING → DELIVERED 다. 세탁 완료에서 곧장
    // 배달 완료를 부르면 400 DELIVERY_INVALID_STATUS 로 거부된다(carry-platform #206).
    expect(nextAction('LAUNDRY_COMPLETE')?.kind).toBe('start-delivery');
    expect(nextAction('DELIVERY_PENDING')?.kind).toBe('delivery');
  });

  it('배달 출발만 사진 없이 진행한다', () => {
    expect(nextAction('LAUNDRY_COMPLETE')).toEqual({
      kind: 'start-delivery',
      label: '배달 출발',
      needsWeight: false,
      needsPhotos: false,
    });
    expect(nextAction('PICKUP_PENDING')?.needsPhotos).toBe(true);
    expect(nextAction('PICKED_UP')?.needsPhotos).toBe(true);
    expect(nextAction('IN_LAUNDRY')?.needsPhotos).toBe(true);
    expect(nextAction('DELIVERY_PENDING')?.needsPhotos).toBe(true);
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
