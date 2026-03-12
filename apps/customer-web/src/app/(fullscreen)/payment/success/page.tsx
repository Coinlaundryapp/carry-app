'use client';

import Link from 'next/link';
import Button from '@shared/ui/Button';
import { ModalOkIcon } from '@assets/icons';
import { useMutation } from '@tanstack/react-query';
import { postConfirmPayment } from '@features/payment/api/payment';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@shared/ui/Loading';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: {
    orderId: number;
    paymentKey: string;
    amount: number;
  };
}) {
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user.accessToken;
  const hasConfirmed = useRef(false);

  const mutation = useMutation({
    mutationFn: () =>
      postConfirmPayment({
        accessToken: accessToken as string,
        orderId: searchParams.orderId,
        paymentKey: searchParams.paymentKey,
        amount: searchParams.amount,
      }),
    retry: false,
  });

  useEffect(() => {
    if (accessToken && !hasConfirmed.current) {
      hasConfirmed.current = true;
      mutation.mutate();
    }
    // mutation.mutate는 useMutation의 안정적 참조 — 의존성 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (mutation.isError) {
      router.replace(`/error?error=payment_error&redirectUrl=/payment/${searchParams.orderId}`);
    }
  }, [mutation.isError, router, searchParams.orderId]);

  if (!mutation.isSuccess) {
    return <Loading />;
  }

  return (
    <main className="flex h-dvh flex-col items-center justify-between gap-[108px] px-6">
      <div className="mt-[103px] flex flex-col items-center justify-center">
        <ModalOkIcon className={'h-20 w-20'} />
        <h2 className="text-label-normal font-title-1 mb-2 mt-4 font-bold">결제 완료!</h2>
        <p className="text-label-alternative font-body-1-normal mt-2 font-medium">
          시간에 맞춰 세탁물을 내놓아 주세요.
        </p>
        <div className="mt-10 h-[206px] w-[350px] bg-gray-300" />
      </div>

      <div className="flex w-full flex-col gap-3 pb-[30px]">
        <Button size="full" state="fillPrimary">
          상세보기
        </Button>
        <Link href="/">
          <Button size="full" state="primary">
            홈으로 가기
          </Button>
        </Link>
      </div>
    </main>
  );
}
