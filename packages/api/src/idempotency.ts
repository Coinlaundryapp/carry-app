/**
 * 멱등 명령(주문 생성·결제 요청·리뷰 작성)에 붙이는 `Idempotency-Key`.
 *
 * 규칙(docs/14): **논리적 시도 1건당 키 1개**. 네트워크 타임아웃 후 "그 요청이 들어갔는지
 * 모를 때" 같은 키로 재전송하면 서버가 저장된 결과를 재생한다(중복 생성 없음). 사용자가 의도한
 * 새 시도는 새 키를 발급한다.
 */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** 새 멱등 키 생성(논리적 시도 1건). */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * 멱등 시도 핸들. `key`는 고정 — 같은 시도의 재전송은 이 핸들을 재사용해 **같은 키**를 보낸다.
 * 사용자가 "다시 시도"를 누르면 [newIdempotencyAttempt]를 새로 만들어 새 키를 쓴다.
 */
export interface IdempotencyAttempt {
  readonly key: string;
}

export function newIdempotencyAttempt(): IdempotencyAttempt {
  return { key: newIdempotencyKey() };
}
