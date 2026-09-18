import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { devLogin, type Role } from '../fixtures/auth';

/**
 * SP2 — 인가 네거티브(실 필터체인 관통).
 *
 * 역할 게이트(#144 세탁소 운영역할, 코디네이터 전용)와 인증 가드(401)가 **실제 백엔드 보안
 * 필터 + @PreAuthorize**에서 거부되는지 단언한다. 전부 **거부(403/401)=상태 무변경**이라
 * 직렬 공유 dev-유저 사가 happy-path를 교란하지 않는다(비파괴).
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). baseURL 없는 api project에서 돈다.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

async function authedContext(role: Role): Promise<APIRequestContext> {
  const base = await request.newContext();
  const { accessToken } = await devLogin(base, role);
  await base.dispose();
  return request.newContext({
    baseURL: BACKEND_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

// 유효 바디 — @Valid 400이 아니라 인가 403이 나오는지 본다(검증은 인가 전에 돌 수 있으므로 바디는 정상).
const VALID_LAUNDROMAT = {
  name: 'E2E Negative Wash',
  roadAddress: 'Seoul Gangnam Teheran-ro 1',
  latitude: 37.5,
  longitude: 127.0,
  options: [] as string[],
};

test.describe('인가 네거티브 (실 필터체인)', () => {
  test('CUSTOMER가 세탁소를 등록하면 403 — 운영 역할 전용(#144)', async () => {
    const ctx = await authedContext('CUSTOMER');
    const res = await ctx.post('/api/v2/laundromats', { data: VALID_LAUNDROMAT });
    expect(res.status(), await res.text()).toBe(403);
    await ctx.dispose();
  });

  test('CARRIER가 세탁소를 등록하면 403', async () => {
    const ctx = await authedContext('CARRIER');
    const res = await ctx.post('/api/v2/laundromats', { data: VALID_LAUNDROMAT });
    expect(res.status(), await res.text()).toBe(403);
    await ctx.dispose();
  });

  test('CUSTOMER가 코디네이터 전용 엔드포인트에 접근하면 403', async () => {
    const ctx = await authedContext('CUSTOMER');
    const res = await ctx.get('/api/v2/coordinator/dispatches');
    expect(res.status(), await res.text()).toBe(403);
    await ctx.dispose();
  });

  test('토큰 없이 보호 엔드포인트에 접근하면 401', async () => {
    const ctx = await request.newContext({ baseURL: BACKEND_URL });
    const res = await ctx.get('/api/v2/coordinator/dispatches');
    expect(res.status(), await res.text()).toBe(401);
    await ctx.dispose();
  });
});
