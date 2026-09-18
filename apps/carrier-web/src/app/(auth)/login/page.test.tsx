import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import LoginPage from './page';

describe('LoginPage', () => {
  afterEach(() => window.localStorage.clear());

  it('로그인 클릭 시 dev-login 토큰을 저장하고 홈으로 이동한다', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

    await waitFor(() => expect(tokenStore.get()?.accessToken).toBe('mock-access'));
    expect(useRouter().replace).toHaveBeenCalledWith('/');
  });

  it('dev-login 실패 시 에러를 표시하고 토큰을 저장하지 않는다', async () => {
    server.use(
      http.post('*/api/v2/auth/dev-login', () =>
        HttpResponse.json({ status: 500, code: 'ERROR', message: '서버 오류' }, { status: 500 }),
      ),
    );
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

    expect(await screen.findByText(/로그인에 실패/)).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
  });
});
