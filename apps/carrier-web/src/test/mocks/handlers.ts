import { http, HttpResponse } from 'msw';

/**
 * carrier-web 공용 msw 핸들러. feature 테스트가 `server.use(...)`로 시나리오별
 * 핸들러를 덮어쓴다. 여기엔 모든 테스트가 공유하는 인증 표면만 둔다.
 */

const ok = <T>(data: T, status = 200) => ({ data, status, code: 'SUCCESS', message: 'Success' });

export const handlers = [
  // dev-login — 역할별 토큰 발급.
  http.post('*/api/v2/auth/dev-login', () =>
    HttpResponse.json(ok({ accessToken: 'mock-access', refreshToken: 'mock-refresh' })),
  ),
  // refresh — 토큰 회전.
  http.post('*/api/v2/auth/refresh', () =>
    HttpResponse.json(ok({ accessToken: 'rotated-access', refreshToken: 'rotated-refresh' })),
  ),
];
