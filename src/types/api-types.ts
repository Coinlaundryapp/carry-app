export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiBodyResponse<T> {
  body: T;
  headers: any;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: string;
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
