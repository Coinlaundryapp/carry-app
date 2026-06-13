/**
 * 백엔드 `ApiResponse` 봉투의 에러 표현. 재시도 판단은 HTTP status가 아니라 `code`로 한다
 * (같은 409라도 CONCURRENT_MODIFICATION은 재시도 가능, DUPLICATE_REVIEW는 불가 — docs/14).
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly traceId?: string,
  ) {
    super(message || `[${status}] ${code}`);
    this.name = 'ApiError';
  }
}

/** 백엔드 공통 응답 봉투(carry-common ApiResponse). */
export interface ApiEnvelope<T> {
  status: number;
  code: string;
  message: string;
  data?: T;
  traceId?: string;
}
