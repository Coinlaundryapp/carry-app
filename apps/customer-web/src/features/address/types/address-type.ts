export type GetAddressesResType = AddressListItem[];

export type AddressListItem = {
  addressId: number;
  addressLabel: string;
  fullAddress: string;
  isDefault: boolean;
};

/** @deprecated AddressListItem으로 대체 */
export type AddressType = AddressListItem;

/**
 * POST/PUT 요청 시 사용하는 주소 페이로드(앱 내부 표현).
 *
 * v2 배송지 생성/수정은 좌표·우편번호·서비스 권역(`areaCode`)을 **필수**로 요구한다.
 * 이 값들은 주소검색(geocode) 선택 시 폼에 채워지며(생성), 편집 시에는 기존 배송지에서
 * 라운드트립된다. geocode가 우편번호를 못 주거나(`null`) 권역을 모를 때의 기본값은
 * API 매핑 레이어(`addressApi`)가 채운다(areaCode 기본 'GANGNAM').
 *
 * ⚠️ `deliveryNotes`·`entranceType`은 v2 배송지 계약에 대응 필드가 없어 전송 시 버려진다
 * (배송 요청사항은 주문 단계에서 별도 관리). 출입정보는 `entranceDetail` → v2 `entranceInfo`.
 */
export type AddressPayload = {
  addressLabel: string;
  recipientPhone: string;
  recipientName: string;
  baseAddress: string;
  detailAddress: string;
  deliveryNotes: string;
  entranceType: string;
  entranceDetail: string;
  /** geocode 선택/편집 라운드트립으로 채워지는 v2 필수 지오 필드 */
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  areaCode?: string;
};
