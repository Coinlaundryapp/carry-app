import { LaundryStatusType } from '@features/status/types/laundry-status-type';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  accessToken: string;
  refreshToken: string;
}

export type TGetAddressSearchListRes = {
  content: {
    addressName: string;
    addressType: string;
    regionAddress: { addressName: string };
    roadAddress: string | null;
    /** v2 geocode가 동봉하는 지오 필드 — 검색 결과 선택 시 배송지 폼에 채워진다. */
    latitude?: number;
    longitude?: number;
    zipCode?: string;
  }[];
  pagination: {
    hasNext: boolean;
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export type TAddressRes = {
  addressLabel: string;
  baseAddress: string;
  deliveryNotes: string;
  detailAddress: string;
  entranceDetail: string;
  entranceType: string;
  id: number;
  isDefaultAddress: boolean;
  recipientName: string;
  recipientPhone: string;
  userId: number;
  /** v2 라운드트립용 지오 필드 — 편집 저장 시 그대로 다시 전송한다. */
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  areaCode?: string;
};

// 서비스 가능 여부 api
type ServiceAvailabilityLevel = 'AVAILABLE' | 'POTENTIALLY_AVAILABLE' | 'UNAVAILABLE';

export interface ServiceAvailabilityResponse {
  serviceAvailabilityLevel: ServiceAvailabilityLevel;
  region: {
    city: string;
    district: string | null;
  };
}

export interface ServiceAvailabiltyRegionRes {
  city: 'SEOUL_SI' | 'INCHEON_SI';
  district: string;
  latitude: number;
  longitude: number;
}

// 서비스 오픈 알림 등록 api
type NotificationType = 'ALARM_TALK' | 'SMS' | 'EMAIL';

export interface NotificationBody {
  region: {
    city: string;
    district: string;
  };
  notificationType: NotificationType;
  contact: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export type Address = {
  id: number;
  userId: number;
  isDefaultAddress: boolean;
  addressLabel: string;
  recipientName: string;
  recipientPhone: string;
  baseAddress: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  deliveryNotes: string;
  entranceType: string;
  entranceDetail: string;
};

// 주문 명세서 조회 api
export interface OrderDetailRes {
  id: number;
  status: LaundryStatusType;
  orderContent: {
    orderUnitType: 'SOLO' | 'ECONOMY' | 'TEAM';
    orderRequestType: string;
    laundryItemType: 'REGULAR' | 'BLANKET' | 'REGULAR_AND_BLANKET' | 'SHOES';
    laundrySpecs: [];
    washOption: string;
    dryOption: string;
    additonalOption: [];
  };
  laundromatName: string;
  shippingAddress: {
    addressLabel: string;
    recipientPhone: string;
    recipientName: string;
    baseAddress: string;
    detailAddress: string;
    deliveryNotes: string; // 배송시 요청 사항
    entranceType: string;
    entranceDetail: string;
  };
  orderShedule: {
    desiredPickupDateTime: string; // 희망 수거 일시
    desiredDeliveryDate: string; // 희망 배송 일시
  };
  paymentDetails: {
    estimatedPayment: {
      // 주문 완료 단계에서 확인 가능한 예상 결제 정보
      discounts: {
        laundryDiscounts: [];
        deliveryDiscounts: [];
      };
    };
    charges: {
      laundryPrice: number; // 세탁 가격
      deliveryFee: number; // 배송 수수료
      serviceFee: number; // 대행 수수료
    };
    netAmount: number; // (부과된 요금 총액 - 할인 총액)
  };
  confirmedPayment: null; // 주문 완료 단계에서는 알 수 없다.
}

// 주문 목록 조회 api
export interface OrderListRes {
  id: number; // orderId, 주문 번호
  orderedAt: string; // 주문 일자
  status: LaundryStatusType; // [Enum] 주문 명세서 상태
  orderContent: {
    orderUnitType: 'SOLO' | 'ECONOMY' | 'TEAM';
    orderRequestType: string;
    laundryItemType: 'REGULAR' | 'BLANKET' | 'REGULAR_AND_BLANKET' | 'SHOES';
  };
  laundromatName: string;
  paymentDetails: {
    estimatedPayment: {
      discounts: {
        laundryDiscounts: []; // 세탁 할인 목록
        deliveryDiscounts: []; // 배송 할인 목록
      };
      charges: {
        laundryPrice: number; // 세탁 가격
        deliveryFee: number; // 배송 수수료
        serviceFee: number; // 대행 수수료
      };
      netAmount: number; // 최종 결제 금액 (부과된 요금 총액 - 할인 총액)
    };
  };
  confirmedPayment: null; // '주문 완료' 단계에서는 알 수 없다.
}
