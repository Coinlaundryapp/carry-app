import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import { getAreas, registerArea, removeArea } from './areaApi';

const ok = <T>(data: T, status = 200) =>
  HttpResponse.json({ data, status, code: 'SUCCESS', message: 'ok' }, { status });
const area = (over: Record<string, unknown> = {}) => ({
  id: 1,
  carrierId: 7,
  areaCode: 'GANGNAM',
  areaName: '강남구',
  active: true,
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('areaApi', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getAreas는 내 권역 목록을 반환한다', async () => {
    server.use(
      http.get('*/api/v2/carrier-areas', () => ok([area(), area({ id: 2, areaCode: 'SEOCHO' })])),
    );
    expect(await getAreas()).toHaveLength(2);
  });

  it('registerArea는 areaCode/areaName을 보내고 등록된 권역을 반환한다', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post('*/api/v2/carrier-areas', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return ok(area(), 201);
      }),
    );
    const result = await registerArea('GANGNAM', '강남구');
    expect(body).toEqual({ areaCode: 'GANGNAM', areaName: '강남구' });
    expect(result.areaCode).toBe('GANGNAM');
  });

  it('removeArea는 areaCode를 쿼리로 보내고 204를 처리한다', async () => {
    let url: URL | undefined;
    server.use(
      http.delete('*/api/v2/carrier-areas', ({ request }) => {
        url = new URL(request.url);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(removeArea('GANGNAM')).resolves.toBeUndefined();
    expect(url?.searchParams.get('areaCode')).toBe('GANGNAM');
  });
});
