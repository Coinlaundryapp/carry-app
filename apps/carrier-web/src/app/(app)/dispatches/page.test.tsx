import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DispatchesPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const d = (over: Record<string, unknown> = {}) => ({
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

describe('DispatchesPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('수락 대기 목록을 렌더한다', async () => {
    server.use(
      http.get('*/api/v2/dispatches/available', () => ok([d(), d({ id: 2, orderId: 11 })])),
    );
    render(<DispatchesPage />);
    expect(await screen.findByText('주문 #10')).toBeInTheDocument();
    expect(screen.getByText('주문 #11')).toBeInTheDocument();
  });

  it('선점 경합(409) 시 안내를 띄우고 목록을 새로고침한다', async () => {
    // 첫 로드: [10, 11]. 선점(409 — 11은 이미 다른 배달원이 가져감) 후 재로드: [10]만 남음.
    let loadCount = 0;
    server.use(
      http.get('*/api/v2/dispatches/available', () => {
        loadCount += 1;
        return loadCount === 1 ? ok([d(), d({ id: 2, orderId: 11 })]) : ok([d()]);
      }),
      http.post('*/api/v2/dispatches/2/claim', () =>
        HttpResponse.json(
          { status: 409, code: 'CONFLICT', message: '이미 선점됨' },
          { status: 409 },
        ),
      ),
    );
    render(<DispatchesPage />);
    const row11 = (await screen.findByText('주문 #11')).closest('li')!;
    await userEvent.click(within(row11).getByRole('button', { name: '선점' }));

    expect(await screen.findByRole('status')).toHaveTextContent('이미 다른 배달원이 선점');
    await waitFor(() => expect(screen.queryByText('주문 #11')).not.toBeInTheDocument());
    expect(screen.getByText('주문 #10')).toBeInTheDocument();
  });

  it('내 배차 탭으로 전환하면 내 배차 목록을 불러온다', async () => {
    server.use(
      http.get('*/api/v2/dispatches/available', () => ok([])),
      http.get('*/api/v2/dispatches/my', () =>
        ok([d({ id: 3, orderId: 20, status: 'ASSIGNED', carrierId: 7 })]),
      ),
    );
    render(<DispatchesPage />);
    await userEvent.click(screen.getByRole('tab', { name: '내 배차' }));
    expect(await screen.findByText('주문 #20')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '상세 보기' })).toHaveAttribute(
      'href',
      '/dispatches/3',
    );
  });
});
