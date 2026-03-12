'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Button from '@shared/ui/Button';
import { DeliveryManSadIcon } from '@assets/icons';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError]', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <DeliveryManSadIcon />
      <h2 className="text-label-normal font-heading-1 font-semibold">문제가 발생했습니다</h2>
      <p className="text-label-alternative font-body-1-normal text-center font-medium">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button size="full" state="fillPrimary" onClick={reset}>
        <p className="font-body-1-normal font-semibold">다시 시도</p>
      </Button>
    </div>
  );
}
