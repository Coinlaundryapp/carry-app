import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SocialLoginButton from './SocialLoginButton';
import KakaoLoginButton from './KakaoLoginButton';

const signInMock = vi.fn();
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

// @assets/icons 배럴은 vitest에서 .svg를 data-URI 문자열로 해석하므로 더미 컴포넌트로 대체.
vi.mock('@assets/icons', () => ({
  KakaoIcon: () => null,
}));

describe('SocialLoginButton', () => {
  beforeEach(() => {
    signInMock.mockClear();
  });

  it.each([
    ['KAKAO', '카카오로 시작하기', 'kakao'],
    ['NAVER', '네이버로 시작하기', 'naver'],
    ['GOOGLE', '구글로 시작하기', 'google'],
  ] as const)('%s 버튼: 라벨 렌더 + 클릭 시 signIn(%s)', (provider, label, id) => {
    render(<SocialLoginButton provider={provider} />);

    const button = screen.getByRole('button', { name: new RegExp(label) });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(signInMock).toHaveBeenCalledWith(id);
  });
});

describe('KakaoLoginButton (브라우저)', () => {
  beforeEach(() => {
    signInMock.mockClear();
  });

  it('WebView가 아니면 signIn("kakao")를 트리거하는 카카오 버튼을 렌더', () => {
    render(<KakaoLoginButton />);

    const button = screen.getByRole('button', { name: /카카오로 시작하기/ });
    fireEvent.click(button);
    expect(signInMock).toHaveBeenCalledWith('kakao');
  });
});
