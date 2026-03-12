'use client';

import Link from 'next/link';
import { DeliveryManSadIcon } from '@assets/icons';
import Button from '@shared/ui/Button';

export default function NotFoundPage() {
  return (
    <main className="bg-background mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-between">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-6">
          <DeliveryManSadIcon />
        </div>
        <h2 className="text-label-normal font-heading-1 mb-2 font-semibold">
          페이지를 찾을 수 없어요.
        </h2>
        <p className="text-label-alternative font-body-1-normal font-medium">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
      </div>
      <div className="mb-[30px] w-full px-6">
        <Link href="/">
          <Button size="full" state="fillPrimary" onClick={() => {}}>
            <p className="font-body-1-normal font-semibold">홈으로 이동</p>
          </Button>
        </Link>
      </div>
    </main>
  );
}
