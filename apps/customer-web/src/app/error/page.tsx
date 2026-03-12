'use client';

import Button from '@shared/ui/Button';
import { AUTH_ERROR, AuthErrorType } from '@shared/types/auth-error-types';
import { DeliveryManSadIcon } from '@assets/icons';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as AuthErrorType;
  const redirectUrl = searchParams.get('redirectUrl');
  const errorMessage = error && AUTH_ERROR[error] ? AUTH_ERROR[error] : AUTH_ERROR.server_error;
  const handleRedirect = () => {
    // 내부 경로만 허용 (open redirect 방지)
    if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
      router.replace(redirectUrl);
      return;
    }
    router.back();
  };

  return (
    <main className="bg-background mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-between">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-6">
          <DeliveryManSadIcon />
        </div>
        <h2 className="text-label-normal font-heading-1 mb-2 font-semibold">
          {errorMessage.title}
        </h2>
        <p className="text-label-alternative font-body-1-normal font-medium">
          {errorMessage.description}
        </p>
      </div>
      <div className="mb-[30px] w-full px-6">
        <Button size="full" state="fillPrimary" onClick={handleRedirect}>
          <p className="font-body-1-normal font-semibold">{errorMessage.buttonText}</p>
        </Button>
      </div>
    </main>
  );
}
