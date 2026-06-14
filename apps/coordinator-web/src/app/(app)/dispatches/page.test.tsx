import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DispatchesPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });

describe('DispatchesPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('기본 PENDING 필터로 배차 목록을 보여준다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/dispatches', ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBe('PENDING');
        return ok([
          { id: 1, orderId: 10, status: 'PENDING', areaCode: 'GANGNAM', carrierId: null },
        ]);
      }),
    );
    render(<DispatchesPage />);
    expect(await screen.findByText('주문 #10')).toBeInTheDocument();
    expect(screen.getByText(/권역 GANGNAM/)).toBeInTheDocument();
  });

  it('조회 실패 시 에러를 표시한다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/dispatches', () =>
        HttpResponse.json({ status: 500, code: 'ERROR', message: '오류' }, { status: 500 }),
      ),
    );
    render(<DispatchesPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/불러오지 못/);
  });
});
