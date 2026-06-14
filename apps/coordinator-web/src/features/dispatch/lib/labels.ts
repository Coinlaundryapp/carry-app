/** 배차 상태 → 한글 라벨. (DispatchStatus: PENDING/ASSIGNED/ACCEPTED/CANCELLED/TIMEOUT) */
export const DISPATCH_STATUS_LABEL: Record<string, string> = {
  PENDING: '대기',
  ASSIGNED: '배정됨',
  ACCEPTED: '수락됨',
  CANCELLED: '취소됨',
  TIMEOUT: '시간초과',
};

export function dispatchStatusLabel(status: string): string {
  return DISPATCH_STATUS_LABEL[status] ?? status;
}

/** 미배정(PENDING) 배차만 코디네이터가 특정 배달원에게 배정할 수 있다. */
export function canAssign(status: string): boolean {
  return status === 'PENDING';
}

/** 진행 중(PENDING/ASSIGNED/ACCEPTED) 배차만 취소할 수 있다. */
export function canCancel(status: string): boolean {
  return ['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(status);
}
