import { redirect } from 'next/navigation';
import { auth } from '@features/auth/api/auth';
import SignupForm from '@features/auth/ui/SignupForm';

/**
 * 신규 소셜 가입 페이지 — REGISTRATION_REQUIRED 세션(signupToken 있고 accessToken 없음) 전용.
 * 세션의 prefill(검증 이메일/닉네임)을 폼에 주입한다.
 * 직접 접근 방어: 가입 대기 세션이 아니면 로그인/홈으로 되돌린다(미들웨어 게이트 이중화).
 */
export default async function SignupPage({
  searchParams,
}: Readonly<{
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  const session = await auth();

  // 이미 로그인 완료(accessToken 존재) → 홈.
  if (session?.user?.accessToken) redirect('/');
  // 가입 대기 세션이 아니면 → 로그인.
  if (!session?.signupToken) redirect('/login');

  const callbackUrl =
    typeof searchParams.callbackUrl === 'string' ? searchParams.callbackUrl : '/login-done';

  return (
    <SignupForm
      signupToken={session.signupToken}
      prefillEmail={session.prefill?.email}
      prefillNickname={session.prefill?.nickname}
      callbackUrl={callbackUrl}
    />
  );
}
