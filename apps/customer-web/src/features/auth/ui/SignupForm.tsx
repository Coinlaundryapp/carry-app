'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@carry/api';
import { Input } from '@shared/ui/Input';
import Button from '@shared/ui/Button';
import { formatPhoneNumber } from '@shared/lib/formatPhoneNumber';
import { sanitizeCallbackUrl } from '@shared/lib/sanitizeCallbackUrl';
import { postSignup } from '@features/auth/api/signup';

interface SignupFormProps {
  /** 로그인 단계가 발급한 가입 토큰(REGISTRATION_REQUIRED). */
  signupToken: string;
  /** 검증된 소셜 이메일 — 있으면 email 필드를 고정(비편집)하고 이 값으로 가입한다. */
  prefillEmail?: string;
  /** 소셜 프로필 닉네임 — 이름 필드 기본값(편집 가능). */
  prefillNickname?: string;
  /** 가입 완료 후 이동 경로(로그인 딥링크 유지). */
  callbackUrl?: string;
}

/**
 * 2단계 소셜 가입 폼 — name/phone/email 입력 → `/api/v2/auth/signup` → 발급 토큰으로 세션 확립.
 *
 * 검증 이메일(prefillEmail)이 있으면 email 필드는 **고정(비편집)**된다: 백엔드가 계정 이메일을
 * 검증 이메일로 잠그므로 다른 값 전송은 무의미하며, 사용자 변경을 원천 차단한다.
 */
export default function SignupForm({
  signupToken,
  prefillEmail,
  prefillNickname,
  callbackUrl = '/login-done',
}: SignupFormProps) {
  const router = useRouter();
  const emailLocked = Boolean(prefillEmail);
  // 방어적 재검증 — prop이 이미 정제되었더라도 Open Redirect를 이중 차단한다.
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);

  const [name, setName] = useState(prefillNickname ?? '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim() !== '' && phone.trim() !== '' && email.trim() !== '';

  const handleSubmit = async () => {
    if (submitting || !isValid) return;
    setSubmitting(true);
    setEmailError(undefined);

    try {
      const tokens = await postSignup({
        signupToken,
        name: name.trim(),
        phone,
        // 검증 이메일 고정 시 prefillEmail을 그대로 전송(백엔드 계정 이메일 잠금과 일치).
        email: emailLocked ? prefillEmail! : email.trim(),
      });

      // 발급 토큰을 credentials로 주입해 세션을 로그인 상태(accessToken 존재)로 전환.
      const result = await signIn('credentials', {
        signupAccessToken: tokens.accessToken,
        signupRefreshToken: tokens.refreshToken,
        redirect: false,
      });

      if (result?.error) {
        setSubmitting(false);
        router.replace(`/error?error=${encodeURIComponent(result.error)}`);
        return;
      }

      router.replace(safeCallbackUrl);
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.status === 409) {
        setEmailError('이미 사용 중인 이메일이에요');
        return;
      }
      console.error('[Signup] failed:', error);
      router.replace('/error?error=server_error');
    }
  };

  return (
    <main className="flex h-full flex-col px-6 pt-[74px]">
      <div className="mb-8">
        <h1 className="text-label-strong font-title-1 font-bold">회원 정보를 입력해주세요</h1>
        <p className="text-label-alternative font-body-1-normal mt-2 font-medium">
          서비스 이용을 위해 아래 정보가 필요해요
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Input
          type="text"
          status="primary"
          title="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
        />
        <Input
          type="text"
          status="primary"
          title="전화번호"
          value={phone}
          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          placeholder="전화번호를 입력해주세요"
        />
        <Input
          type="text"
          status={emailError ? 'error' : emailLocked ? 'done' : 'primary'}
          statusMessage={emailError}
          title="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={emailLocked}
          placeholder="이메일을 입력해주세요"
        />
      </div>

      <div className="mt-auto py-6">
        <Button
          size="full"
          state={isValid && !submitting ? 'fillPrimary' : 'disabled'}
          disabled={!isValid || submitting}
          onClick={() => void handleSubmit()}
        >
          <p className="font-body-1-normal font-semibold">
            {submitting ? '가입 중...' : '가입 완료'}
          </p>
        </Button>
      </div>
    </main>
  );
}
