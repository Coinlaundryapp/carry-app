import type { Schemas } from '@carry/types';
import { TLaundromats, TMetaData } from '@features/map/types/map-type';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 세탁소 검색 — carry-platform **v2**(`GET /api/v2/laundromats` findNearby).
 *
 * v2 `NearbyLaundromatResponse`(laundromat + distanceMeters)를 기존 화면이 쓰는 앱 타입
 * `TLaundromats`로 매핑한다(strangler/anti-corruption). ⚠️ v2 세탁소 응답엔 배송비·리뷰
 * 통계가 없어 화면 표시는 0으로 degrade한다(후속 known-debt). `distance`는 v2 distanceMeters를
 * 그대로 흘려 v1 동작을 보존한다(거리 기반 배송비 계산 의미 유지).
 */

type V2Nearby = Schemas['NearbyLaundromatResponse'];

function toLaundromat(n: V2Nearby): TLaundromats {
  const l = n.laundromat;
  return {
    id: l.id,
    name: l.name,
    address: [l.roadAddress, l.detailAddress].filter(Boolean).join(' '),
    distance: n.distanceMeters,
    latitude: l.latitude,
    longitude: l.longitude,
    options: l.options,
    mediaResources: (l.mediaResources ?? []).map((m) => ({
      extension: m.extension,
      mediaUrl: m.url,
    })),
    // v2 미제공 — 화면은 0으로 표시(후속 known-debt)
    groupDeliveryFee: 0,
    reviewAverageRating: 0,
    reviewCount: 0,
  };
}

export async function getLaundromats(mapData: TMetaData): Promise<TLaundromats[]> {
  const client = createV2Client();
  const data = await client.request<V2Nearby[]>(
    `/api/v2/laundromats?latitude=${mapData.lat}&longitude=${mapData.lng}`,
    { method: 'GET' },
  );
  return (data ?? []).map(toLaundromat);
}
