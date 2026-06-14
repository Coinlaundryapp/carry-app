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

/** 배정된 배차에서만 수락/거절이 가능하다(ASSIGNED → ACCEPTED | PENDING). */
export function canRespond(status: string): boolean {
  return status === 'ASSIGNED';
}
