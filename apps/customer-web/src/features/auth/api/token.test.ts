import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { login, loginWithKakaoToken, refreshAccessToken } from './token';

describe('token API', () => {
  describe('login', () => {
    it('정상 응답 → accessToken + refreshToken 반환', async () => {
      const result = await login({
        authorizationCode: 'test-code',
        redirectUri: 'http://localhost:3000/callback',
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('422 응답 → login_error 에러', async () => {
      server.use(
        http.post('*/api/v1/sign/login', () => {
          return HttpResponse.json(
            { data: null, status: 422, message: 'Unprocessable Entity' },
            { status: 422 },
          );
        }),
      );

      await expect(
        login({
          authorizationCode: 'invalid-code',
          redirectUri: 'http://localhost:3000/callback',
        }),
      ).rejects.toThrow('login_error');
    });

    it('500 응답 → server_error 에러', async () => {
      server.use(
        http.post('*/api/v1/sign/login', () => {
          return HttpResponse.json(
            { data: null, status: 500, message: 'Internal Server Error' },
            { status: 500 },
          );
        }),
      );

      await expect(
        login({
          authorizationCode: 'test-code',
          redirectUri: 'http://localhost:3000/callback',
        }),
      ).rejects.toThrow('server_error');
    });
  });

  describe('loginWithKakaoToken', () => {
    it('정상 응답 → accessToken + refreshToken 반환', async () => {
      const result = await loginWithKakaoToken({
        accessToken: 'kakao-access-token',
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('422 응답 → login_error 에러', async () => {
      server.use(
        http.post('*/api/v1/sign/login', () => {
          return HttpResponse.json(
            { data: null, status: 422, message: 'Unprocessable Entity' },
            { status: 422 },
          );
        }),
      );

      await expect(loginWithKakaoToken({ accessToken: 'invalid-token' })).rejects.toThrow(
        'login_error',
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('정상 갱신 → 새 토큰 반환', async () => {
      const result = await refreshAccessToken({
        refreshToken: 'old-refresh-token',
      });

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('만료된 토큰 → null 반환', async () => {
      server.use(
        http.post('*/api/v1/sign/reissue', () => {
          return HttpResponse.json(
            { data: null, status: 401, message: 'Unauthorized' },
            { status: 401 },
          );
        }),
      );

      const result = await refreshAccessToken({
        refreshToken: 'expired-token',
      });

      expect(result).toBeNull();
    });
  });
});
