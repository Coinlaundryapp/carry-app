export type LaundryType = 'general' | 'bedding' | 'mixed' | 'shoes';
export type SelectedOptions = {
  laundryType?: LaundryType;
  service?: 'wash-and-dry' | 'wash-only' | 'dry-only';
  wash?: 'standard-wash' | 'hot-water-wash';
  dry?: 'low-temp-dry' | 'high-temp-dry';
  shoePairs?: number;
  folding?: boolean;
  softener?: boolean;
};
export type LaundryOrderFormType = {
  options: SelectedOptions;
  addressId: number; // 배송지 ID
  sharedEntrancePassword?: string; // 공동현관 비밀번호
  preferredPickupTime: string; // 희망 수거 시간
  preferredDeliveryTime: string; // 희망 배송 완료 시간
  termsAgreed: boolean; // 주문 내용 확인 및 동의 여부
  privacyPolicyAgreed: boolean; // 개인정보 수집/이용 동의
  thirdPartyPolicyAgreed: boolean; // 개인정보 제3자 제공 동의
};
