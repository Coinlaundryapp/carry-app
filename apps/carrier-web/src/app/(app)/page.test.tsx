import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import HomePage from './page';

const meBody = {
  data: {
    id: 7,
    email: 'carrier@carry.dev',
    name: '김배달',
    phone: '010',
    role: 'CARRIER',
    isActive: true,
  },
  status: 200,
  code: 'SUCCESS',
  message: 'ok',
};

describe('HomePage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('인증된 배달원 프로필을 표시한다(/users/me 1콜)', async () => {
    server.use(http.get('*/api/v2/users/me', () => HttpResponse.json(meBody)));
    render(<HomePage />);
    expect(await screen.findByText('김배달님')).toBeInTheDocument();
    expect(screen.getByText(/CARRIER/)).toBeInTheDocument();
  });

  it('로그아웃 시 토큰을 폐기하고 /login으로 이동한다', async () => {
    server.use(http.get('*/api/v2/users/me', () => HttpResponse.json(meBody)));
    render(<HomePage />);
    await screen.findByText('김배달님');

    await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(tokenStore.get()).toBeNull();
    expect(useRouter().replace).toHaveBeenCalledWith('/login');
  });
});
