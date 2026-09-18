import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import AreasPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const area = (over: Record<string, unknown> = {}) => ({
  id: 1,
  carrierId: 7,
  areaCode: 'GANGNAM',
  areaName: '강남구',
  active: true,
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('AreasPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('등록된 권역 목록을 보여준다', async () => {
    server.use(http.get('*/api/v2/carrier-areas', () => ok([area()])));
    render(<AreasPage />);
    expect(await screen.findByText('강남구')).toBeInTheDocument();
    expect(screen.getByText('GANGNAM')).toBeInTheDocument();
  });

  it('권역을 등록하면 목록이 갱신된다', async () => {
    let registered = false;
    server.use(
      http.get('*/api/v2/carrier-areas', () => ok(registered ? [area()] : [])),
      http.post('*/api/v2/carrier-areas', () => {
        registered = true;
        return ok(area());
      }),
    );
    render(<AreasPage />);
    expect(await screen.findByText('등록된 권역이 없습니다.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '등록' }));
    expect(await screen.findByText('강남구')).toBeInTheDocument();
  });

  it('권역을 해제하면 목록에서 사라진다', async () => {
    let removed = false;
    server.use(
      http.get('*/api/v2/carrier-areas', () => ok(removed ? [] : [area()])),
      http.delete('*/api/v2/carrier-areas', () => {
        removed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    render(<AreasPage />);
    await screen.findByText('강남구');

    await userEvent.click(screen.getByRole('button', { name: '해제' }));
    await waitFor(() => expect(screen.getByText('등록된 권역이 없습니다.')).toBeInTheDocument());
  });
});
