import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';

const authMock = vi.fn();
vi.mock('@features/auth/api/auth', () => ({ auth: () => authMock() }));

// next의 redirect는 실제로 예외를 던져 렌더를 중단시킨다 — 동일 흐름을 흉내낸다.
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
vi.mock('next/navigation', () => ({ redirect: (p: string) => redirectMock(p) }));

// SignupForm은 client 컴포넌트 — 전달 props만 검사하므로 더미로 대체.
vi.mock('@features/auth/ui/SignupForm', () => ({ default: () => null }));

import SignupPage from './page';

type FormProps = {
  signupToken: string;
  prefillEmail?: string;
  prefillNickname?: string;
  callbackUrl: string;
};

async function renderPage(searchParams: Record<string, string | string[] | undefined>) {
  const el = (await SignupPage({ searchParams })) as ReactElement<FormProps>;
  return el.props;
}

describe('SignupPage 게이트', () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  it('로그인 완료(accessToken 존재) → 홈(/)으로 redirect', async () => {
    authMock.mockResolvedValue({ user: { accessToken: 'at' } });
    await expect(renderPage({})).rejects.toThrow('REDIRECT:/');
    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('가입 대기 세션이 아님(signupToken 없음) → 로그인(/login)으로 redirect', async () => {
    authMock.mockResolvedValue(null);
    await expect(renderPage({})).rejects.toThrow('REDIRECT:/login');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('가입 대기 세션 → prefill을 폼에 주입하고 통과', async () => {
    authMock.mockResolvedValue({
      signupToken: 'st',
      prefill: { email: 'verified@carry.com', nickname: '길동' },
      user: { accessToken: '' },
    });
    const props = await renderPage({});
    expect(redirectMock).not.toHaveBeenCalled();
    expect(props.signupToken).toBe('st');
    expect(props.prefillEmail).toBe('verified@carry.com');
    expect(props.prefillNickname).toBe('길동');
  });

  it('악성 callbackUrl 쿼리는 sanitize되어 안전한 기본값으로 폼에 전달된다', async () => {
    authMock.mockResolvedValue({ signupToken: 'st', user: { accessToken: '' } });
    const props = await renderPage({ callbackUrl: 'https://evil.com' });
    expect(props.callbackUrl).toBe('/login-done');
  });

  it('정상 callbackUrl 쿼리는 그대로 폼에 전달된다', async () => {
    authMock.mockResolvedValue({ signupToken: 'st', user: { accessToken: '' } });
    const props = await renderPage({ callbackUrl: '/orders/123' });
    expect(props.callbackUrl).toBe('/orders/123');
  });
});
