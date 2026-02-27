'use client';

import { useEffect } from 'react';
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
  }, [error]);

  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-between bg-white">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-6">
          <DeliveryManSadIcon />
        </div>
        <h2 className="mb-2 font-semibold text-label-normal font-heading-1">
          문제가 발생했습니다
        </h2>
        <p className="font-medium text-label-alternative font-body-1-normal">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
      <div className="mb-[30px] w-full px-6">
        <Button size="full" state="fillPrimary" onClick={reset}>
          <p className="font-semibold font-body-1-normal">다시 시도</p>
        </Button>
      </div>
    </main>
  );
}
