import { describe, it, expect } from 'vitest';
import { unwrap } from './client';
import { ApiError } from './errors';

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('unwrap', () => {
  it('성공 봉투는 data를 반환한다', async () => {
    const res = jsonResponse({ status: 200, code: 'SUCCESS', message: 'Success', data: { id: 7 } });
    await expect(unwrap<{ id: number }>(res)).resolves.toEqual({ id: 7 });
  });

  it('에러 봉투는 ApiError(code·traceId 보존)를 던진다', async () => {
    const res = jsonResponse(
      { status: 409, code: 'CONCURRENT_MODIFICATION', message: '충돌', traceId: 'abc123' },
      { status: 409 },
    );
    await expect(unwrap(res)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'CONCURRENT_MODIFICATION',
      traceId: 'abc123',
    });
    await expect(unwrap(jsonResponse({ status: 409, code: 'X', message: 'm' }, { status: 409 }))).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it('204 No Content는 undefined를 반환한다', async () => {
    const res = new Response(null, { status: 204 });
    await expect(unwrap(res)).resolves.toBeUndefined();
  });
});
