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

// 서비스 가능 여부 api
type ServiceAvailabilityLevel = 'AVAILABLE' | 'POTENTIALLY_AVAILABLE' | 'UNAVAILABLE';

export interface ServiceAvailabilityResponse {
  serviceAvailabilityLevel: ServiceAvailabilityLevel;
  region: {
    city: string;
    district: string | null;
  };
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
