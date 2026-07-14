import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiError } from '@carry/api';
import SignupForm from './SignupForm';

const postSignupMock = vi.fn();
vi.mock('@features/auth/api/signup', () => ({
  postSignup: (...args: unknown[]) => postSignupMock(...args),
}));

const signInMock = vi.fn();
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByPlaceholderText(label), { target: { value } });
}

describe('SignupForm', () => {
  beforeEach(() => {
    postSignupMock.mockReset();
    signInMock.mockReset();
    replaceMock.mockReset();
    postSignupMock.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
    signInMock.mockResolvedValue({ ok: true });
  });

  it('검증 이메일 prefill이 있으면 email 필드는 값이 채워지고 비편집(readOnly)', () => {
    render(
      <SignupForm signupToken="st" prefillEmail="verified@carry.com" callbackUrl="/login-done" />,
    );

    const email = screen.getByPlaceholderText(/이메일/) as HTMLInputElement;
    expect(email.value).toBe('verified@carry.com');
    expect(email.readOnly).toBe(true);
  });

  it('검증 이메일이 없으면 email 필드는 편집 가능하고 비어있다', () => {
    render(<SignupForm signupToken="st" callbackUrl="/login-done" />);

    const email = screen.getByPlaceholderText(/이메일/) as HTMLInputElement;
    expect(email.value).toBe('');
    expect(email.readOnly).toBe(false);
  });

  it('제출 → postSignup에 {signupToken,name,phone,email} 전송 후 signIn으로 세션 확립', async () => {
    render(<SignupForm signupToken="st" callbackUrl="/login-done/payment/1" />);

    fill(/이름/, '홍길동');
    fill(/전화번호/, '010-1234-5678');
    fill(/이메일/, 'me@carry.com');
    fireEvent.click(screen.getByRole('button', { name: /가입/ }));

    await waitFor(() => expect(postSignupMock).toHaveBeenCalled());
    expect(postSignupMock).toHaveBeenCalledWith({
      signupToken: 'st',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'me@carry.com',
    });
    await waitFor(() => expect(signInMock).toHaveBeenCalled());
    expect(signInMock).toHaveBeenCalledWith('credentials', {
      signupAccessToken: 'at',
      signupRefreshToken: 'rt',
      redirect: false,
    });
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login-done/payment/1'));
  });

  it('검증 이메일 고정 시 prefill 값이 그대로 postSignup에 전송된다', async () => {
    render(
      <SignupForm signupToken="st" prefillEmail="verified@carry.com" callbackUrl="/login-done" />,
    );

    fill(/이름/, '홍길동');
    fill(/전화번호/, '010-1234-5678');
    fireEvent.click(screen.getByRole('button', { name: /가입/ }));

    await waitFor(() => expect(postSignupMock).toHaveBeenCalled());
    expect(postSignupMock.mock.calls[0][0].email).toBe('verified@carry.com');
  });

  it('악성 callbackUrl(외부 URL)은 방어적으로 안전한 기본값으로 대체되어 replace된다', async () => {
    render(<SignupForm signupToken="st" callbackUrl="https://evil.com" />);

    fill(/이름/, '홍길동');
    fill(/전화번호/, '010-1234-5678');
    fill(/이메일/, 'me@carry.com');
    fireEvent.click(screen.getByRole('button', { name: /가입/ }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login-done'));
    expect(replaceMock).not.toHaveBeenCalledWith('https://evil.com');
  });

  it('409(이메일 중복) → "이미 사용 중인 이메일" 메시지 노출, signIn 미호출', async () => {
    postSignupMock.mockRejectedValue(new ApiError(409, 'EMAIL_CONFLICT', 'conflict'));
    render(<SignupForm signupToken="st" callbackUrl="/login-done" />);

    fill(/이름/, '홍길동');
    fill(/전화번호/, '010-1234-5678');
    fill(/이메일/, 'dup@carry.com');
    fireEvent.click(screen.getByRole('button', { name: /가입/ }));

    await waitFor(() => expect(screen.getByText(/이미 사용 중인 이메일/)).toBeInTheDocument());
    expect(signInMock).not.toHaveBeenCalled();
  });
});
