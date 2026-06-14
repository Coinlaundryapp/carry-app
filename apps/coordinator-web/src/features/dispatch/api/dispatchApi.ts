import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 배차 코디네이터 API — carry-platform v2(`/api/v2/coordinator/dispatches`,
 * `@PreAuthorize hasRole('COORDINATOR')`).
 *
 * 코디네이터는 미배정(PENDING) 배차를 권역 배달원에게 직접 배정한다(→ ASSIGNED, 이후
 * 배달원이 수락). carrier self-claim과 달리 assign은 ASSIGNED 단계를 거친다.
 */

export type Dispatch = Schemas['DispatchResponse'];
export type CarrierArea = Schemas['CarrierAreaResponse'];

function listQuery(
  status: string | undefined,
  areaCode: string | undefined,
  cursor: number | undefined,
  size: number,
): string {
  const q = new URLSearchParams();
  if (status) q.set('status', status);
  if (areaCode) q.set('areaCode', areaCode);
  if (cursor != null) q.set('cursor', String(cursor));
  q.set('size', String(size));
  return q.toString();
}

/** 배차 목록 — 상태·권역 필터(생략 시 전체). */
export async function getDispatches(
  status?: string,
  areaCode?: string,
  cursor?: number,
  size = 20,
): Promise<Dispatch[]> {
  const client = createV2Client();
  const data = await client.request<Dispatch[]>(
    `/api/v2/coordinator/dispatches?${listQuery(status, areaCode, cursor, size)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

/** 배차 상세. */
export async function getDispatch(dispatchId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/coordinator/dispatches/${dispatchId}`, {
    method: 'GET',
    cache: 'no-cache',
  });
}

/** 특정 권역의 배달원 목록(배정 후보 조회). */
export async function getCarriersByArea(areaCode: string): Promise<CarrierArea[]> {
  const client = createV2Client();
  const data = await client.request<CarrierArea[]>(
    `/api/v2/coordinator/dispatches/carriers?areaCode=${encodeURIComponent(areaCode)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

/** 미배정 배차를 특정 배달원에게 배정한다(→ ASSIGNED). */
export async function assignDispatch(dispatchId: number, carrierId: number): Promise<Dispatch> {
  const client = createV2Client();
  return client.request<Dispatch>(`/api/v2/coordinator/dispatches/${dispatchId}/assign`, {
    method: 'POST',
    body: { carrierId },
  });
}

/** 배차를 취소한다. 204 No Content. */
export async function cancelDispatch(dispatchId: number, reason: string): Promise<void> {
  const client = createV2Client();
  await client.request<void>(`/api/v2/coordinator/dispatches/${dispatchId}/cancel`, {
    method: 'POST',
    body: { reason },
  });
}
