import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth/lib/tokenStore';
import { createV2Client } from './v2-client';

describe('createV2Client (coordinator — refresh coordinator 활성)', () => {
  afterEach(() => window.localStorage.clear());

  it('저장된 accessToken을 Authorization 헤더로 붙인다', async () => {
    tokenStore.set({ accessToken: 'tok-123', refreshToken: 'r' });
    let auth: string | null = null;
    server.use(
      http.get('*/api/v2/users/me', ({ request }) => {
        auth = request.headers.get('Authorization');
        return HttpResponse.json({ data: { id: 1 }, status: 200, code: 'SUCCESS', message: 'ok' });
      }),
    );
    const client = createV2Client();
    await client.request('/api/v2/users/me', { method: 'GET' });
    expect(auth).toBe('Bearer tok-123');
  });

  it('401이면 refresh 회전 후 새 토큰으로 1회 재시도한다', async () => {
    tokenStore.set({ accessToken: 'stale', refreshToken: 'r' });
    const seen: (string | null)[] = [];
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        const auth = request.headers.get('Authorization');
        seen.push(auth);
        if (auth === 'Bearer stale') {
          return HttpResponse.json(
            { status: 401, code: 'TOKEN_EXPIRED', message: '만료' },
            { status: 401 },
          );
        }
        return HttpResponse.json({ data: [], status: 200, code: 'SUCCESS', message: 'ok' });
      }),
    );
    const client = createV2Client();
    await client.request('/api/v2/coordinator/orders', { method: 'GET' });
    // 첫 시도(stale·401) → 회전 → 재시도(rotated-access·200).
    expect(seen).toEqual(['Bearer stale', 'Bearer rotated-access']);
    // 회전된 토큰이 저장돼야 한다.
    expect(tokenStore.get()?.accessToken).toBe('rotated-access');
  });
});
