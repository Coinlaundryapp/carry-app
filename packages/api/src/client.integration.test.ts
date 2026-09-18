import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from './client';
import { type TokenPair, type TokenStore } from './auth';
import { defaultRetryPolicy } from './retry';

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ status: 200, code: 'SUCCESS', message: 'ok', data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
function errResponse(status: number, code: string): Response {
  return new Response(JSON.stringify({ status, code, message: 'e' }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
function memoryStore(initial: TokenPair | null): TokenStore {
  let t = initial;
  return { get: () => t, set: (n) => (t = n), clear: () => (t = null) };
}

const noSleep = async () => {};

describe('createApiClient', () => {
  it('멱등 키가 있으면 Idempotency-Key 헤더를 부착한다', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(ok({ id: 1 }));
    const client = createApiClient({ baseUrl: 'http://api', fetchImpl });

    await client.request('/api/v2/orders', { method: 'POST', body: { x: 1 }, idempotencyKey: 'key-123' });

    const [, init] = fetchImpl.mock.calls[0];
    const headers = new Headers(init!.headers);
    expect(headers.get('Idempotency-Key')).toBe('key-123');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(init!.body).toBe('{"x":1}');
  });

  it('현재 토큰을 Authorization 헤더로 보낸다', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(ok(null));
    const store = memoryStore({ accessToken: 'acc', refreshToken: 'ref' });
    const client = createApiClient({ baseUrl: 'http://api', fetchImpl, tokenStore: store, refresh: async () => null });

    await client.request('/api/v2/users/me');

    const headers = new Headers(fetchImpl.mock.calls[0][1]!.headers);
    expect(headers.get('Authorization')).toBe('Bearer acc');
  });

  it('401 → refresh 회전 후 새 토큰으로 1회 재시도해 성공한다', async () => {
    const store = memoryStore({ accessToken: 'old', refreshToken: 'r0' });
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(errResponse(401, 'UNAUTHORIZED'))
      .mockResolvedValueOnce(ok({ id: 9 }));
    const refresh = vi.fn(async () => ({ accessToken: 'new', refreshToken: 'r1' }));
    const client = createApiClient({ baseUrl: 'http://api', fetchImpl, tokenStore: store, refresh });

    const result = await client.request<{ id: number }>('/api/v2/users/me');

    expect(result).toEqual({ id: 9 });
    expect(refresh).toHaveBeenCalledOnce();
    // 재시도는 회전된 새 토큰으로 나간다
    expect(new Headers(fetchImpl.mock.calls[1][1]!.headers).get('Authorization')).toBe('Bearer new');
  });

  it('refresh 실패(여전히 401)면 재요청 없이 ApiError를 던지고 로그아웃한다', async () => {
    const store = memoryStore({ accessToken: 'old', refreshToken: 'r0' });
    const fetchImpl = vi.fn(async () => errResponse(401, 'UNAUTHORIZED'));
    const onLogout = vi.fn();
    const client = createApiClient({
      baseUrl: 'http://api',
      fetchImpl,
      tokenStore: store,
      refresh: async () => null,
      onLogout,
    });

    await expect(client.request('/api/v2/users/me')).rejects.toMatchObject({ status: 401 });
    expect(onLogout).toHaveBeenCalledOnce();
    expect(store.get()).toBeNull();
    expect(fetchImpl).toHaveBeenCalledOnce(); // 회전 실패 → 재시도 안 함
  });

  it('503 transient는 백오프 후 재시도해 성공한다', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(errResponse(503, 'PG_GATEWAY_UNAVAILABLE'))
      .mockResolvedValueOnce(ok({ paid: true }));
    const client = createApiClient({
      baseUrl: 'http://api',
      fetchImpl,
      retryPolicy: { ...defaultRetryPolicy, jitter: () => 0 },
      sleep: noSleep,
    });

    const result = await client.request<{ paid: boolean }>('/api/v2/payments', { method: 'POST' });

    expect(result).toEqual({ paid: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('재시도 불가 에러(404)는 즉시 던진다', async () => {
    const fetchImpl = vi.fn(async () => errResponse(404, 'ORDER_NOT_FOUND'));
    const client = createApiClient({ baseUrl: 'http://api', fetchImpl, sleep: noSleep });

    await expect(client.request('/api/v2/orders/1')).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND' });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
