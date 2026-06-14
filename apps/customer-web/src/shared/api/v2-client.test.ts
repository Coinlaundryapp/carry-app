import { describe, it, expect, vi } from 'vitest';
import { createV2Client } from '@shared/api/v2-client';

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ status: 200, code: 'SUCCESS', message: 'ok', data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('createV2Client', () => {
  it('accessToken을 Authorization 헤더로 주입하고 v2 봉투를 언래핑한다', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(ok({ id: 1 }));
    const client = createV2Client({ accessToken: 'acc', baseUrl: 'http://api', fetchImpl });

    const result = await client.request<{ id: number }>('/api/v2/users/me');

    expect(result).toEqual({ id: 1 });
    const headers = new Headers(fetchImpl.mock.calls[0][1]!.headers);
    expect(headers.get('Authorization')).toBe('Bearer acc');
  });

  it('토큰이 없으면 Authorization 없이 호출한다(public 엔드포인트)', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(ok([]));
    const client = createV2Client({ baseUrl: 'http://api', fetchImpl });

    await client.request('/api/v2/geo/geocode?address=x');

    const headers = new Headers(fetchImpl.mock.calls[0][1]!.headers);
    expect(headers.get('Authorization')).toBeNull();
  });
});
