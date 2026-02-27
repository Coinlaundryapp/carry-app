import { fetchExtended, ApiError } from '@shared/api/api-client';
import { ApiResponse, AuthResponse } from '@shared/types/api-types';

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
    if (error instanceof ApiError && error.status === 422) {
      throw new Error('login_error');
    }
    throw new Error('server_error');
  }
}

export async function loginWithKakaoToken({ accessToken }: { accessToken: string }) {
  try {
    const res = await fetchExtended<ApiResponse<AuthResponse>>('/api/v1/sign/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        accessToken,
      },
    });
    const data = res.body.data;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      throw new Error('login_error');
    }
    throw new Error('server_error');
  }
}

export async function refreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
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
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    return null;
  }
}
