'use client';

import Button from '@/components/share/Button';
import { useToastStore } from '@/store/toast-store';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginDonePage({
  params,
}: {
  params: {
    redirect?: string;
  };
}) {
  const router = useRouter();
  const { redirect } = params;
  const redirectUrl = redirect ? '/' + redirect : '/';
  const handleRedirect = () => {
    router.replace(redirectUrl);
  };
  const { addToast } = useToastStore();
  useEffect(() => {
    addToast({
      message: '회원가입이 완료되었습니다.',
      type: 'success',
    });
  }, [addToast]);
  return (
    <main className="flex h-full flex-col items-center px-6 pt-36">
      <h2 className="font-bold text-label-normal font-title-1">더이상 기다리지 마세요!</h2>
      <p className="mb-14 font-medium text-label-alternative font-body-1-normal">
        당신의 소중한 세탁 시간을 아껴드릴게요!
      </p>
      <Image
        src="/assets/images/login-done.png"
        alt="Laundry"
        width={322}
        height={284}
        className="mb-32"
      />
      <Button size="full" state="fillPrimary" text="확인" onClick={handleRedirect} />
    </main>
  );
}
