import { REQUEST_OPTIONS } from '@features/address/lib/request-options';
import type { TAddressRes } from '@shared/types/api-types';
import type { AddressPayload } from '@features/address/types/address-type';
import type {
  AddressFormData,
  AddressEntry,
  EntranceSelection,
  RequestSelection,
} from './useAddressForm';

/**
 * 배송지 폼이 보유하는 지오 필드 — 주소검색(geocode) 선택 시 채워지거나(생성)
 * 편집 시 기존 배송지에서 라운드트립된다. v2 생성/수정의 필수 필드를 채우는 출처.
 */
export type AddressGeo = {
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  areaCode?: string;
};

// ── 순수 변환 함수 ──

/**
 * REQUEST_OPTIONS 기반 변환: selectedRequest → deliveryNotes 문자열
 *
 * value '4'(직접 입력)인 경우 requestText를 그대로 반환하고,
 * 그 외에는 REQUEST_OPTIONS에서 label을 찾아 반환합니다.
 */
export function requestToDeliveryNotes(selectedRequest: RequestSelection): string {
  if (selectedRequest.value === '4') {
    return selectedRequest.requestText;
  }
  const option = REQUEST_OPTIONS.find((o) => o.value === selectedRequest.value);
  return option ? option.label : '';
}

/**
 * 역변환: deliveryNotes 문자열 → RequestSelection
 *
 * REQUEST_OPTIONS label과 일치하면 해당 value를 사용하고,
 * 일치하지 않으면 '4'(직접 입력)로 설정합니다.
 */
export function deliveryNotesToRequest(notes: string): RequestSelection {
  if (!notes) {
    return { value: '1', requestText: '' };
  }
  const matched = REQUEST_OPTIONS.find((option) => option.label === notes);
  if (matched) {
    return { value: matched.value, requestText: notes };
  }
  return { value: '4', requestText: notes };
}

/**
 * 폼 전체 상태 → API 페이로드 조립
 *
 * geo(좌표·우편번호·권역)는 주소검색 선택/편집 라운드트립으로 채워진다. 누락 시의 기본값
 * (areaCode 'GANGNAM' 등)은 API 매핑 레이어(`addressApi`)가 채우므로 여기선 그대로 흘린다.
 */
export function buildAddressPayload(
  formData: AddressFormData,
  address: AddressEntry,
  entrance: EntranceSelection,
  request: RequestSelection,
  geo: AddressGeo = {},
): AddressPayload {
  return {
    addressLabel: formData.addressLabel,
    recipientPhone: formData.phone,
    recipientName: formData.name,
    baseAddress: address.main,
    detailAddress: address.detail,
    deliveryNotes: requestToDeliveryNotes(request),
    entranceType: entrance.value,
    entranceDetail: entrance.text,
    latitude: geo.latitude,
    longitude: geo.longitude,
    zipCode: geo.zipCode,
    areaCode: geo.areaCode,
  };
}

/**
 * API 응답 → 폼 초기값 변환 (편집 모드용)
 *
 * null/undefined 필드는 기본값으로 fallback합니다.
 */
export function addressResponseToFormData(data: TAddressRes): {
  formData: AddressFormData;
  address: AddressEntry;
  entrance: EntranceSelection;
  request: RequestSelection;
  geo: AddressGeo;
} {
  return {
    formData: {
      addressLabel: data.addressLabel || '',
      name: data.recipientName || '',
      phone: data.recipientPhone || '',
    },
    address: {
      main: data.baseAddress || '',
      detail: data.detailAddress || '',
    },
    entrance: {
      value: data.entranceType || '1',
      text: data.entranceDetail || '',
    },
    request: {
      value: data.deliveryNotes
        ? REQUEST_OPTIONS.find((option) => option.label === data.deliveryNotes)?.value || '4'
        : '1',
      requestText: data.deliveryNotes || '',
    },
    // 편집 저장 시 v2 필수 지오 필드를 그대로 다시 보내기 위해 보존한다.
    geo: {
      latitude: data.latitude,
      longitude: data.longitude,
      zipCode: data.zipCode,
      areaCode: data.areaCode,
    },
  };
}
