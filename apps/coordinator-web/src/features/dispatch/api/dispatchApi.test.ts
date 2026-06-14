import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth/lib/tokenStore';
import { assignDispatch, cancelDispatch, getCarriersByArea, getDispatches } from './dispatchApi';

const ok = <T>(data: T) => ({ data, status: 200, code: 'SUCCESS', message: 'ok' });

describe('dispatchApi (coordinator)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getDispatches는 상태·권역 필터를 쿼리로 보낸다', async () => {
    let url: string | undefined;
    server.use(
      http.get('*/api/v2/coordinator/dispatches', ({ request }) => {
        url = request.url;
        return HttpResponse.json(ok([{ id: 1, status: 'PENDING', areaCode: 'GANGNAM' }]));
      }),
    );
    const items = await getDispatches('PENDING', 'GANGNAM');
    expect(items).toHaveLength(1);
    expect(url).toContain('status=PENDING');
    expect(url).toContain('areaCode=GANGNAM');
  });

  it('getCarriersByArea는 권역의 배달원 목록을 반환한다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/dispatches/carriers', ({ request }) => {
        expect(new URL(request.url).searchParams.get('areaCode')).toBe('GANGNAM');
        return HttpResponse.json(
          ok([{ id: 1, carrierId: 100, areaCode: 'GANGNAM', active: true }]),
        );
      }),
    );
    const carriers = await getCarriersByArea('GANGNAM');
    expect(carriers[0].carrierId).toBe(100);
  });

  it('assignDispatch는 carrierId를 본문에 담아 POST한다', async () => {
    let body: unknown;
    server.use(
      http.post('*/api/v2/coordinator/dispatches/5/assign', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(ok({ id: 5, status: 'ASSIGNED', carrierId: 100 }));
      }),
    );
    const d = await assignDispatch(5, 100);
    expect(body).toEqual({ carrierId: 100 });
    expect(d.status).toBe('ASSIGNED');
  });

  it('cancelDispatch는 reason을 담아 POST하고 204를 허용한다', async () => {
    let body: unknown;
    server.use(
      http.post('*/api/v2/coordinator/dispatches/5/cancel', async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(cancelDispatch(5, '운영 취소')).resolves.toBeUndefined();
    expect(body).toEqual({ reason: '운영 취소' });
  });
});
