import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 배차 API — carry-platform v2(`/api/v2/dispatches`, `@PreAuthorize hasRole('CARRIER')`).
 *
 * carrier-web은 greenfield라 매핑 레이어(F1 anti-corruption)가 불필요 — `@carry/types`의
 * `DispatchResponse`를 그대로 노출한다.
 *
 * 배차 생명주기: `PENDING`(공개) → 배달원이 **선점(claim)** → `ASSIGNED` → **수락(accept)**
 * → `ACCEPTED`(여기서 `DispatchAcceptedEvent` 발행 → carry-delivery 사가가 Delivery 생성).
 * **거절(reject)** 시 `PENDING`으로 복귀. 선점은 낙관적 동시성이라 경합 시 409.
 */

export type Dispatch = Schemas['DispatchResponse'];

function listQuery(cursor: number | undefined, size: number): string {
  const q = new URLSearchParams();
  if (cursor != null) q.set('cursor', String(cursor));
  q.set('size', String(size));
  return q.toString();
}

/** 수락 가능한(공개) 배차 목록. */
export async function getAvailableDispatches(cursor?: number, size = 20): Promise<Dispatch[]> {
  const client = createV2Client();
  const data = await client.request<Dispatch[]>(
    `/api/v2/dispatches/available?${listQuery(cursor, size)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

/** 내가 선점/배정받은 배차 목록. */
export async function getMyDispatches(cursor?: number, size = 20): Promise<Dispatch[]> {
  const client = createV2Client();
  const data = await client.request<Dispatch[]>(
    `/api/v2/dispatches/my?${listQuery(cursor, size)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

export async function getDispatch(dispatchId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/dispatches/${dispatchId}`, {
    method: 'GET',
    cache: 'no-cache',
  });
}

/** 공개된 배차를 선점한다. 경합(이미 선점됨) 시 ApiError(409). */
export async function claimDispatch(dispatchId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/dispatches/${dispatchId}/claim`, { method: 'POST' });
}

/** 배정된 배차를 수락한다(→ ACCEPTED, 배달 사가 트리거). */
export async function acceptDispatch(dispatchId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/dispatches/${dispatchId}/accept`, { method: 'POST' });
}

/** 배정된 배차를 거절한다(→ PENDING 복귀). */
export async function rejectDispatch(dispatchId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/dispatches/${dispatchId}/reject`, { method: 'POST' });
}
