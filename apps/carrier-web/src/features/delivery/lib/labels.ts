/** 배달 상태 → 한글 라벨. (DeliveryStatus) */
export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PICKUP_PENDING: '수거 대기',
  PICKED_UP: '수거 완료',
  IN_LAUNDRY: '세탁 중',
  LAUNDRY_COMPLETE: '세탁 완료',
  DELIVERY_PENDING: '배달 대기',
  DELIVERED: '배달 완료',
  CANCELLED: '취소됨',
};

export function deliveryStatusLabel(status: string): string {
  return DELIVERY_STATUS_LABEL[status] ?? status;
}

export type DeliveryActionKind = 'pickup' | 'washing' | 'drying' | 'delivery';

export interface DeliveryAction {
  kind: DeliveryActionKind;
  label: string;
  /** pickup만 무게 입력이 필요하다. */
  needsWeight: boolean;
}

/**
 * 현재 상태에서 배달원이 수행할 다음 액션. 완료(DELIVERED)·취소·미지원 상태면 null.
 * 상태기계 화면이 이 매핑으로 폼/버튼을 결정한다.
 */
export function nextAction(status: string): DeliveryAction | null {
  switch (status) {
    case 'PICKUP_PENDING':
      return { kind: 'pickup', label: '수거 완료', needsWeight: true };
    case 'PICKED_UP':
      return { kind: 'washing', label: '세탁 시작', needsWeight: false };
    case 'IN_LAUNDRY':
      return { kind: 'drying', label: '건조 완료', needsWeight: false };
    case 'LAUNDRY_COMPLETE':
    case 'DELIVERY_PENDING':
      return { kind: 'delivery', label: '배달 완료', needsWeight: false };
    default:
      return null;
  }
}
