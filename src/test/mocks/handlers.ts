import { http, HttpResponse } from 'msw';

// ── 성공 응답 헬퍼 ──

const authSuccessBody = {
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
  status: 200,
  message: 'success',
};

// ── 핸들러 ──

export const handlers = [
  // 로그인 (authorizationCode + redirectUri 방식)
  http.post('*/api/v1/sign/login', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    // authorizationCode 방식
    if (body.authorizationCode) {
      return HttpResponse.json(authSuccessBody, { status: 200 });
    }

    // accessToken 방식 (카카오 토큰)
    if (body.accessToken) {
      return HttpResponse.json(authSuccessBody, { status: 200 });
    }

    // 잘못된 요청
    return HttpResponse.json(
      { data: null, status: 422, message: 'Unprocessable Entity' },
      { status: 422 },
    );
  }),

  // 토큰 갱신
  http.post('*/api/v1/sign/reissue', () => {
    return HttpResponse.json(
      {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
        status: 200,
        message: 'success',
      },
      { status: 200 },
    );
  }),
];
