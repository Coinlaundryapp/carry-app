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
    regionAddresss: { addressName: string };
    roadAddress: string | null;
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
  isDefaultAddress: false;
  recipientName: string;
  recipientPhone: string;
  userId: number;
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
