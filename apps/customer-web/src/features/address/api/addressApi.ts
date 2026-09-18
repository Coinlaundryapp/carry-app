import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';
import { AddressPayload, AddressListItem } from '@features/address/types/address-type';
import { TGetAddressSearchListRes, TAddressRes } from '@shared/types/api-types';

/**
 * 배송지 API — carry-platform **v2** 계약(`/api/v2/shipping-addresses`, `/api/v2/geo/geocode`).
 *
 * v2 응답 형태(`ShippingAddressResponse`: id·alias·roadAddress…)는 기존 customer-web 화면이
 * 기대하는 앱 타입(`AddressListItem`·`TAddressRes`)과 다르다. 화면을 건드리지 않도록
 * **이 레이어가 v2 ↔ 앱 형태를 매핑**한다(strangler/anti-corruption). 호출 시그니처도
 * 그대로 둬(accessToken 인자) 소비자 코드는 무변경.
 *
 * ⚠️ v2 생성/수정은 좌표·우편번호·`areaCode`를 필수로 받지만 customer 흐름엔 권역 해소
 * 수단이 없다 — 좌표·우편번호는 geocode 선택으로 채우고, `areaCode`는 시드/배차가 쓰는
 * 유일 권역 'GANGNAM'을 기본값으로 둔다(F1 M-2 실용 병합 결정, 후속은 known-debt).
 */

const DEFAULT_AREA_CODE = 'GANGNAM';
const DEFAULT_ZIP_CODE = '00000';

type V2Address = Schemas['ShippingAddressResponse'];
type V2Geocoding = Schemas['GeocodingResponse'];
type V2CreateReq = Schemas['CreateShippingAddressRequest'];
type V2UpdateReq = Schemas['UpdateShippingAddressRequest'];

// ── v2 → 앱 매핑 ──

/** 목록 항목: 화면은 별칭과 한 줄 주소만 쓴다. */
function toListItem(r: V2Address): AddressListItem {
  return {
    addressId: r.id,
    addressLabel: r.alias,
    fullAddress: `${r.roadAddress} ${r.detailAddress}`.trim(),
    isDefault: r.isDefault,
  };
}

/** 상세: 편집 폼이 읽는 형태 + 저장 라운드트립용 지오 필드 보존. */
function toAddressRes(r: V2Address): TAddressRes {
  return {
    id: r.id,
    userId: 0, // v2 응답엔 없음 — 폼에서 미사용
    addressLabel: r.alias,
    recipientName: r.recipientName,
    recipientPhone: r.recipientPhone,
    baseAddress: r.roadAddress,
    detailAddress: r.detailAddress,
    deliveryNotes: '', // v2 배송지 계약에 없음(주문 단계 관리)
    entranceType: '1', // v2엔 출입'유형'이 없음 — 기본값
    entranceDetail: r.entranceInfo ?? '',
    isDefaultAddress: r.isDefault,
    latitude: r.latitude,
    longitude: r.longitude,
    zipCode: r.zipCode,
    areaCode: r.areaCode,
  };
}

// ── 앱 → v2 매핑 ──

function toCreateRequest(p: AddressPayload): V2CreateReq {
  return {
    alias: p.addressLabel,
    roadAddress: p.baseAddress,
    detailAddress: p.detailAddress,
    zipCode: p.zipCode || DEFAULT_ZIP_CODE,
    latitude: p.latitude ?? 0,
    longitude: p.longitude ?? 0,
    recipientName: p.recipientName,
    recipientPhone: p.recipientPhone,
    entranceInfo: p.entranceDetail || null,
    areaCode: p.areaCode || DEFAULT_AREA_CODE,
  };
}

const toUpdateRequest = (p: AddressPayload): V2UpdateReq => toCreateRequest(p);

// ── API ──

export async function getAddresses(accessToken: string | undefined): Promise<AddressListItem[]> {
  const client = createV2Client({ accessToken });
  const data = await client.request<V2Address[]>('/api/v2/shipping-addresses', {
    method: 'GET',
    cache: 'no-cache',
  });
  return (data ?? []).map(toListItem);
}

/**
 * 주소 검색 — v2 geocode(`/api/v2/geo/geocode`). 페이지네이션이 없는 평면 리스트라
 * 기존 SearchForm 무한스크롤과 맞추기 위해 단일 페이지(`hasNext: false`)로 매핑하고,
 * 좌표·우편번호를 각 항목에 동봉해 선택 시 배송지 폼이 채울 수 있게 한다.
 */
export async function getAddressSearchList(
  keyword: string,
  _page: number,
): Promise<TGetAddressSearchListRes> {
  const client = createV2Client();
  const data = await client.request<V2Geocoding[]>(
    `/api/v2/geo/geocode?address=${encodeURIComponent(keyword)}`,
    { method: 'GET', cache: 'no-cache' },
  );
  const results = data ?? [];
  return {
    content: results.map((g) => ({
      addressName: g.roadAddress || g.jibunAddress,
      addressType: g.roadAddress ? 'ROAD' : 'JIBUN',
      regionAddress: { addressName: g.jibunAddress },
      roadAddress: g.roadAddress || null,
      latitude: g.latitude,
      longitude: g.longitude,
      zipCode: g.postalCode ?? '',
    })),
    pagination: {
      hasNext: false,
      pageNumber: 1,
      pageSize: results.length,
      totalElements: results.length,
      totalPages: 1,
    },
  };
}

export async function getAddress(
  accessToken: string | undefined,
  addressId: string | string[] | number,
): Promise<TAddressRes> {
  const client = createV2Client({ accessToken });
  const data = await client.request<V2Address>(`/api/v2/shipping-addresses/${addressId}`, {
    method: 'GET',
    cache: 'no-cache',
  });
  return toAddressRes(data);
}

export async function postAddress(accessToken: string, newAddress: AddressPayload) {
  const client = createV2Client({ accessToken });
  return client.request<V2Address>('/api/v2/shipping-addresses', {
    method: 'POST',
    body: toCreateRequest(newAddress),
  });
}

export async function putAddress(
  accessToken: string,
  addressId: string | string[],
  editAddress: AddressPayload,
) {
  const client = createV2Client({ accessToken });
  return client.request<V2Address>(`/api/v2/shipping-addresses/${addressId}`, {
    method: 'PUT',
    body: toUpdateRequest(editAddress),
  });
}

export async function deleteAddress(accessToken: string, addressId: string | string[]) {
  const client = createV2Client({ accessToken });
  // 204 No Content → request는 undefined를 반환한다.
  return client.request<void>(`/api/v2/shipping-addresses/${addressId}`, {
    method: 'DELETE',
  });
}

/**
 * 기본 배송지 설정 — v1 `PATCH …/default` → v2 `PUT …/default`(setDefault).
 * 함수명은 소비자 무변경을 위해 유지한다.
 */
export async function patchDefaultAddress(accessToken: string, addressId: string | string[]) {
  const client = createV2Client({ accessToken });
  return client.request<void>(`/api/v2/shipping-addresses/${addressId}/default`, {
    method: 'PUT',
  });
}
