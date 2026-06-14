import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 운영 대시보드 API — carry-platform v2(`/api/v2/admin/dashboard`,
 * `@PreAuthorize hasRole('ADMIN')`). coordinator-web의 ADMIN 화면이 소비한다.
 */

export type OperationSummary = Schemas['OperationSummaryResponse'];
export type OperationEvent = Schemas['OperationEventResponse'];

/** 오늘의 주문·배차·배달 운영 요약. */
export async function getSummary(): Promise<OperationSummary> {
  const client = createV2Client();
  return client.request<OperationSummary>('/api/v2/admin/dashboard/summary', {
    method: 'GET',
    cache: 'no-cache',
  });
}

/** 최근 운영 이벤트(최신순). */
export async function getRecentEvents(limit = 50): Promise<OperationEvent[]> {
  const client = createV2Client();
  const data = await client.request<OperationEvent[]>(
    `/api/v2/admin/dashboard/events?limit=${limit}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}
