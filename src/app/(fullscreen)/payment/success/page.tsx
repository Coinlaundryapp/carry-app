'use client';

import Link from 'next/link';
import Button from '@/components/share/Button';
import { ModalOkIcon } from '@assets/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postConfirmPayment } from '@/api/payment';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/share/Loading';

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['postConfirmPayment', searchParams],
    queryFn: () =>
      postConfirmPayment({
        accessToken: accessToken as string,
        orderId: searchParams.orderId,
        paymentKey: searchParams.paymentKey,
        amount: searchParams.amount,
      }),
    enabled: !!accessToken,
    staleTime: 0,
  });
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    router.push(`/error?error=payment_error&redirectUrl=/payment/${searchParams.orderId}`);
    return null;
  }
  return (
    <main className="flex h-dvh flex-col items-center justify-between gap-[108px] px-6">
      <div className="mt-[103px] flex flex-col items-center justify-center">
        <ModalOkIcon className={'h-20 w-20'} />
        <h2 className="mb-2 mt-4 font-bold text-label-normal font-title-1">결제 완료!</h2>
        <p className="mt-2 font-medium text-label-alternative font-body-1-normal">
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
