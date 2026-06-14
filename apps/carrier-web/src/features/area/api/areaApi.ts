import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 배달원 활동 권역 API — carry-platform v2(`/api/v2/carrier-areas`, hasRole('CARRIER')).
 * 배달원이 자신이 활동할 권역을 등록/해제한다. 배차 매칭이 이 권역을 참조한다.
 */

export type CarrierArea = Schemas['CarrierAreaResponse'];

/** 기본 권역 — 시드/배차가 쓰는 유일 권역(F1서 확립한 공통값). */
export const DEFAULT_AREA_CODE = 'GANGNAM';
export const DEFAULT_AREA_NAME = '강남구';

export async function getAreas(): Promise<CarrierArea[]> {
  const client = createV2Client();
  const data = await client.request<CarrierArea[]>('/api/v2/carrier-areas', {
    method: 'GET',
    cache: 'no-cache',
  });
  return data ?? [];
}

export async function registerArea(areaCode: string, areaName: string): Promise<CarrierArea> {
  const client = createV2Client();
  const body: Schemas['RegisterAreaRequest'] = { areaCode, areaName };
  return client.request<CarrierArea>('/api/v2/carrier-areas', { method: 'POST', body });
}

export async function removeArea(areaCode: string): Promise<void> {
  const client = createV2Client();
  // 204 No Content → request는 undefined를 반환한다.
  return client.request<void>(`/api/v2/carrier-areas?areaCode=${encodeURIComponent(areaCode)}`, {
    method: 'DELETE',
  });
}
