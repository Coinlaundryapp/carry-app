import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { devLogin, refreshTokens } from './auth';

describe('auth API (dev-login / refresh)', () => {
  it('devLogin은 역할 토큰쌍을 반환한다', async () => {
    const tokens = await devLogin('CARRIER');
    expect(tokens).toEqual({ accessToken: 'mock-access', refreshToken: 'mock-refresh' });
  });

  it('devLogin은 role을 본문에 담아 보낸다', async () => {
    let captured: unknown;
    server.use(
      http.post('*/api/v2/auth/dev-login', async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          data: { accessToken: 'a', refreshToken: 'r' },
          status: 200,
          code: 'SUCCESS',
          message: 'ok',
        });
      }),
    );
    await devLogin('CARRIER');
    expect(captured).toEqual({ role: 'CARRIER' });
  });

  it('refreshTokens는 회전된 토큰쌍을 반환한다', async () => {
    const rotated = await refreshTokens('old-refresh');
    expect(rotated).toEqual({ accessToken: 'rotated-access', refreshToken: 'rotated-refresh' });
  });

  it('refreshTokens는 회전 실패 시 null을 반환한다(coordinator가 로그아웃 처리)', async () => {
    server.use(
      http.post('*/api/v2/auth/refresh', () =>
        HttpResponse.json(
          { status: 401, code: 'TOKEN_REVOKED', message: '세션이 폐기되었습니다' },
          { status: 401 },
        ),
      ),
    );
    expect(await refreshTokens('reused-refresh')).toBeNull();
  });
});
