import { http, HttpResponse } from 'msw';
import { ApiError } from '@carry/api';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import {
  acceptDispatch,
  claimDispatch,
  getAvailableDispatches,
  getMyDispatches,
  rejectDispatch,
} from './dispatchApi';

const ok = <T>(data: T) => HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });

const dispatch = (over: Record<string, unknown> = {}) => ({
  id: 1,
  orderId: 10,
  laundromatId: 5,
  status: 'PENDING',
  carrierId: null,
  areaCode: 'GANGNAM',
  desiredPickupAt: '2026-06-14T10:00:00Z',
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('dispatchApi', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getAvailableDispatches는 수락 대기 목록을 반환하고 size를 쿼리로 보낸다', async () => {
    let url: URL | undefined;
    server.use(
      http.get('*/api/v2/dispatches/available', ({ request }) => {
        url = new URL(request.url);
        return ok([dispatch(), dispatch({ id: 2 })]);
      }),
    );
    const list = await getAvailableDispatches();
    expect(list).toHaveLength(2);
    expect(url?.searchParams.get('size')).toBe('20');
  });

  it('getMyDispatches는 내 배차 목록을 반환한다', async () => {
    server.use(
      http.get('*/api/v2/dispatches/my', () =>
        ok([dispatch({ id: 3, status: 'ASSIGNED', carrierId: 7 })]),
      ),
    );
    const list = await getMyDispatches();
    expect(list[0].status).toBe('ASSIGNED');
  });

  it('claimDispatch 성공 시 선점된(ASSIGNED) 배차를 반환한다', async () => {
    server.use(
      http.post('*/api/v2/dispatches/1/claim', () =>
        ok(dispatch({ status: 'ASSIGNED', carrierId: 7 })),
      ),
    );
    const claimed = await claimDispatch(1);
    expect(claimed.status).toBe('ASSIGNED');
  });

  it('claimDispatch는 이미 선점된 배차(409)면 ApiError를 던진다', async () => {
    server.use(
      http.post('*/api/v2/dispatches/1/claim', () =>
        HttpResponse.json(
          { status: 409, code: 'CONFLICT', message: '이미 선점됨' },
          { status: 409 },
        ),
      ),
    );
    await expect(claimDispatch(1)).rejects.toMatchObject({ status: 409 });
    await expect(claimDispatch(1)).rejects.toBeInstanceOf(ApiError);
  });

  it('acceptDispatch/rejectDispatch는 전이된 배차를 반환한다', async () => {
    server.use(
      http.post('*/api/v2/dispatches/1/accept', () =>
        ok(dispatch({ status: 'ACCEPTED', carrierId: 7 })),
      ),
      http.post('*/api/v2/dispatches/1/reject', () =>
        ok(dispatch({ status: 'PENDING', carrierId: null })),
      ),
    );
    expect((await acceptDispatch(1)).status).toBe('ACCEPTED');
    expect((await rejectDispatch(1)).status).toBe('PENDING');
  });
});
