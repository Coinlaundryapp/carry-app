import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import HomePage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const meAs = (role: string) =>
  http.get('*/api/v2/users/me', () =>
    ok({ id: 1, email: 'a@b.c', name: 'A', phone: '0', role, isActive: true }),
  );

describe('HomePage (ADMIN 메뉴 가드)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('항상 주문·배차 메뉴를 보여준다', async () => {
    server.use(meAs('COORDINATOR'));
    render(<HomePage />);
    expect(screen.getByText('주문 운영')).toBeInTheDocument();
    expect(screen.getByText('배차 조율')).toBeInTheDocument();
  });

  it('COORDINATOR에겐 운영 대시보드 메뉴가 없다', async () => {
    server.use(meAs('COORDINATOR'));
    render(<HomePage />);
    // role 조회가 끝나도 ADMIN 메뉴는 나타나지 않는다.
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText('운영 대시보드')).not.toBeInTheDocument();
  });

  it('ADMIN에겐 운영 대시보드 메뉴가 노출된다', async () => {
    server.use(meAs('ADMIN'));
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText('운영 대시보드')).toBeInTheDocument());
  });
});
