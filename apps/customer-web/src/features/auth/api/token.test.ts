import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { devLogin, loginWithKakao, refreshAccessToken } from './token';

describe('token API (v2)', () => {
  describe('loginWithKakao', () => {
    it('REGISTERED 응답 → accessToken + refreshToken 반환', async () => {
      const result = await loginWithKakao('kakao-access-token');

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('REGISTRATION_REQUIRED 응답 → registration_required 에러(가입 흐름 후속)', async () => {
      server.use(
        http.post('*/api/v2/auth/login', () =>
          HttpResponse.json(
            {
              data: { status: 'REGISTRATION_REQUIRED', signupToken: 'st' },
              status: 200,
              code: 'SUCCESS',
              message: 'ok',
            },
            { status: 200 },
          ),
        ),
      );

      await expect(loginWithKakao('new-user-token')).rejects.toThrow('registration_required');
    });
  });

  describe('devLogin', () => {
    it('역할로 호출 → 토큰 반환', async () => {
      const result = await devLogin('CUSTOMER');

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('정상 회전 → 새 토큰 반환', async () => {
      const result = await refreshAccessToken('old-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('회전 실패(401 재사용감지 등) → null 반환', async () => {
      server.use(
        http.post('*/api/v2/auth/refresh', () =>
          HttpResponse.json(
            { status: 401, code: 'AUTH_TOKEN_INVALID', message: 'invalid' },
            { status: 401 },
          ),
        ),
      );

      const result = await refreshAccessToken('expired-token');

      expect(result).toBeNull();
    });
  });
});
