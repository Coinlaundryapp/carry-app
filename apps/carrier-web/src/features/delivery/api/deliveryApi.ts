import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 배달 API — carry-platform v2(`/api/v2/deliveries`). 배달원이 배차 수락(ACCEPTED) 후
 * 사가가 생성한 Delivery를 상태기계로 진행한다:
 * `PICKUP_PENDING →(pickup)→ PICKED_UP →(washing)→ IN_LAUNDRY →(drying)→ LAUNDRY_COMPLETE
 * →(delivery)→ DELIVERED`. 각 전이는 증빙 사진(photoIds)을 요구하고 pickup은 무게도 받는다.
 */

export type Delivery = Schemas['DeliveryResponse'];

function listQuery(cursor: number | undefined, size: number): string {
  const q = new URLSearchParams();
  if (cursor != null) q.set('cursor', String(cursor));
  q.set('size', String(size));
  return q.toString();
}

export async function getMyDeliveries(cursor?: number, size = 20): Promise<Delivery[]> {
  const client = createV2Client();
  const data = await client.request<Delivery[]>(
    `/api/v2/deliveries/my?${listQuery(cursor, size)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  return data ?? [];
}

export async function getDelivery(deliveryId: number): Promise<Delivery> {
  const client = createV2Client();
  return client.request<Delivery>(`/api/v2/deliveries/${deliveryId}`, {
    method: 'GET',
    cache: 'no-cache',
  });
}

export interface PickupInput {
  weight: number;
  photoIds: number[];
  /**
   * ⚠️ 계약 갭(known-debt): `CompletePickupRequest`는 주문 메타를 @NotBlank로 요구하지만,
   * 이 필드들은 delivery 상태를 바꾸지 않고 `PickupCompletedEvent` 페이로드로만 흐른다
   * (`delivery.completePickup`은 weight+photoIds만 사용). carrier UI는 고객 소유의 주문 메타를
   * 조회할 표면이 없다(`/v2/orders/{id}`는 customer userId 스코프). 알 수 없으면 degrade
   * 기본값('UNKNOWN'/0/[])을 보낸다 — 근본 해소는 백엔드 saga-enrichment(carry-delivery가
   * 사가로 order-meta를 전달받아 서버측 도출). 2-role E2E(API-level)는 실제 메타를 직접
   * 공급하므로 영향 없음.
   */
  customerId?: number;
  laundryItemType?: string;
  orderUnitType?: string;
  orderRequestType?: string;
  selectedOptions?: Schemas['SelectedOptionSnapshot'][];
}

/** 수거 완료 — 무게와 사진을 기록하고 PICKED_UP으로 전이한다. */
export async function completePickup(deliveryId: number, input: PickupInput): Promise<Delivery> {
  const client = createV2Client();
  const body: Schemas['CompletePickupRequest'] = {
    weight: input.weight,
    photoIds: input.photoIds,
    customerId: input.customerId ?? 0,
    laundryItemType: input.laundryItemType ?? 'UNKNOWN',
    orderUnitType: input.orderUnitType ?? 'UNKNOWN',
    orderRequestType: input.orderRequestType ?? 'UNKNOWN',
    selectedOptions: input.selectedOptions ?? [],
  };
  return client.request<Delivery>(`/api/v2/deliveries/${deliveryId}/pickup`, {
    method: 'POST',
    body,
  });
}

function stepCommand(path: string) {
  return async (deliveryId: number, photoIds: number[]): Promise<Delivery> => {
    const client = createV2Client();
    const body: Schemas['StepPhotoRequest'] = { photoIds };
    return client.request<Delivery>(`/api/v2/deliveries/${deliveryId}/${path}`, {
      method: 'POST',
      body,
    });
  };
}

/** 세탁 시작(→ IN_LAUNDRY). */
export const startWashing = stepCommand('washing');
/** 건조 완료(→ LAUNDRY_COMPLETE). */
export const completeDrying = stepCommand('drying');
/** 배달 완료(→ DELIVERED). */
export const completeDelivery = stepCommand('delivery');
