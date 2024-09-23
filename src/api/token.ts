import { fetchExtended } from '@/api/api-client';
import { ApiResponse, AuthResponse } from '@/types/api-types';

export async function login({
  authorizationCode,
  redirectUri,
}: {
  authorizationCode: string;
  redirectUri: string;
}) {
  try {
    const res = await fetchExtended<ApiResponse<AuthResponse>>('/api/v1/sign/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        authorizationCode,
        redirectUri,
      },
    });
    const data = res.body.data;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '422') {
        throw Error('login_error');
      }
    }
    throw Error('server_error');
  }
}
export async function refreshAccessToken({ refreshToken }: { refreshToken: string }) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>('/api/v1/sign/reissue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `refreshToken=${refreshToken}`,
    },
  });
  const data = res.body.data;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
