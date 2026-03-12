'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Button from '@shared/ui/Button';
import { DeliveryManSadIcon } from '@assets/icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-between bg-white">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-6">
          <DeliveryManSadIcon />
        </div>
        <h2 className="text-label-normal font-heading-1 mb-2 font-semibold">문제가 발생했습니다</h2>
        <p className="text-label-alternative font-body-1-normal font-medium">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
      <div className="mb-[30px] w-full px-6">
        <Button size="full" state="fillPrimary" onClick={reset}>
          <p className="font-body-1-normal font-semibold">다시 시도</p>
        </Button>
      </div>
    </main>
  );
}
