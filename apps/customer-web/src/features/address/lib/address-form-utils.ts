import { REQUEST_OPTIONS } from '@features/address/lib/request-options';
import type { TAddressRes } from '@shared/types/api-types';
import type {
  AddressFormData,
  AddressEntry,
  EntranceSelection,
  RequestSelection,
} from './useAddressForm';

// ── 페이로드 타입 ──

export type AddressPayload = {
  addressLabel: string;
  recipientPhone: string;
  recipientName: string;
  baseAddress: string;
  detailAddress: string;
  deliveryNotes: string;
  entranceType: string;
  entranceDetail: string;
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
 */
export function buildAddressPayload(
  formData: AddressFormData,
  address: AddressEntry,
  entrance: EntranceSelection,
  request: RequestSelection,
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
  };
}
