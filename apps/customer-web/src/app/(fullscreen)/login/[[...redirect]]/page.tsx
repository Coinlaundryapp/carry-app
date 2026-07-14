import Image from 'next/image';
import KakaoLoginButton from '@features/auth/ui/KakaoLoginButton';
import SocialLoginButton from '@features/auth/ui/SocialLoginButton';

export default async function Login({
  params,
  searchParams,
}: Readonly<{
  params: { redirect: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  const redirect = params.redirect;

  // WebView 로그인 완료 후 리다이렉트 경로 계산
  const redirectPath = redirect ? redirect.join('/') : '';
  const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();
  const webViewRedirectUrl = [
    '/login-done',
    redirectPath && `/${redirectPath}`,
    queryString && `?${queryString}`,
  ]
    .filter(Boolean)
    .join('');

  return (
    <main className="flex flex-col items-center gap-10 px-4 pt-[74px] text-center">
      <div>
        <p className="text-label-strong font-title-1 font-bold">
          원하는 시간에 <span className="text-primary-normal">맡기고</span>
        </p>
        <p className="text-label-strong font-title-1 mb-2 font-bold">
          원하는 시간에 <span className="text-primary-normal">받아요</span>
        </p>
        <p className="text-label-alternative font-body-1-normal font-medium">
          코인세탁소에서 더이상 기다릴 필요 없이
        </p>
        <p className="text-label-alternative font-body-1-normal font-medium">
          저희가 세탁물을 배송해 드릴게요!
        </p>
      </div>
      <Image src="/assets/images/login-image.png" alt="Laundry" width={390} height={308} />

      <div className="flex w-full flex-col gap-2">
        <KakaoLoginButton redirectUrl={webViewRedirectUrl} />
        <SocialLoginButton provider="NAVER" callbackUrl={webViewRedirectUrl} />
        <SocialLoginButton provider="GOOGLE" callbackUrl={webViewRedirectUrl} />
      </div>
    </main>
  );
}
