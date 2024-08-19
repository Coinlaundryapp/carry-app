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
