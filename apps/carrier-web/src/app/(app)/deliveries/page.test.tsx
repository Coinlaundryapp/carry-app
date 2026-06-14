import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DeliveriesPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const delivery = (over: Record<string, unknown> = {}) => ({
  id: 1,
  orderId: 10,
  dispatchId: 2,
  carrierId: 7,
  laundromatId: 5,
  status: 'PICKUP_PENDING',
  actualWeight: null,
  steps: [],
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('DeliveriesPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('내 배달 목록을 상태 라벨과 함께 렌더한다', async () => {
    server.use(
      http.get('*/api/v2/deliveries/my', () =>
        ok([delivery(), delivery({ id: 2, orderId: 11, status: 'IN_LAUNDRY' })]),
      ),
    );
    render(<DeliveriesPage />);
    expect(await screen.findByText('주문 #10')).toBeInTheDocument();
    expect(screen.getByText('수거 대기')).toBeInTheDocument();
    expect(screen.getByText('세탁 중')).toBeInTheDocument();
  });

  it('배달이 없으면 안내를 표시한다', async () => {
    server.use(http.get('*/api/v2/deliveries/my', () => ok([])));
    render(<DeliveriesPage />);
    expect(await screen.findByText('진행 중인 배달이 없습니다.')).toBeInTheDocument();
  });
});
