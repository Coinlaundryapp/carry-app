'use client';

import Button from '@shared/ui/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginDonePage({
  params,
  searchParams,
}: Readonly<{
  params: { redirect: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  const router = useRouter();
  const redirectUrl = params.redirect ? `/${params.redirect.join('/')}` : '/';
  const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();
  const finalRedirectUrl = queryString ? `${redirectUrl}?${queryString}` : redirectUrl;
  const handleRedirect = () => {
    router.replace(finalRedirectUrl);
  };

  return (
    <main className="flex h-dvh flex-col items-center justify-center px-6">
      <h2 className="text-label-normal font-title-1 mb-2 font-bold">완료되었습니다!</h2>
      <p className="text-label-alternative font-body-1-normal mb-[30px] font-medium">
        당신의 소중한 세탁 시간을 아껴드릴게요!
      </p>
      <Image
        src="/assets/images/login-done.png"
        alt="Laundry"
        width={322}
        height={284}
        className="mb-32"
      />
      <div className="absolute bottom-[30px] w-full px-6">
        <Button size="full" state="fillPrimary" onClick={handleRedirect}>
          <p className="font-body-1-normal font-semibold">확인</p>
        </Button>
      </div>
    </main>
  );
}
