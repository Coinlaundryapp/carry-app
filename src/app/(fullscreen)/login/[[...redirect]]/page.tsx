import Image from 'next/image';
import { headers } from 'next/headers';
import KakaoLoginButton from '@features/auth/ui/KakaoLoginButton';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY as string;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL as string;

export default async function Login({
  params,
  searchParams,
}: Readonly<{
  params: { redirect: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  const url = new URL(KAKAO_REDIRECT_URL);
  const redirect = params.redirect;
  const headersList = headers();
  const host = headersList.get('host') ?? '';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const BASE_URL = `${protocol}://${host}`;

  // state 파라미터 생성
  const state = {
    redirect: redirect && redirect.join('/'),
    query: searchParams,
  };

  url.searchParams.append('client_id', KAKAO_REST_API_KEY);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', BASE_URL + '/api/kakao');
  url.searchParams.append('state', encodeURIComponent(JSON.stringify(state)));

  return (
    <main className="flex flex-col items-center gap-10 px-4 pt-[74px] text-center">
      <div>
        <p className="font-bold text-label-strong font-title-1">
          원하는 시간에 <span className="text-primary-normal">맡기고</span>
        </p>
        <p className="mb-2 font-bold text-label-strong font-title-1">
          원하는 시간에 <span className="text-primary-normal">받아요</span>
        </p>
        <p className="font-medium text-label-alternative font-body-1-normal">
          코인세탁소에서 더이상 기다릴 필요 없이
        </p>
        <p className="font-medium text-label-alternative font-body-1-normal">
          저희가 세탁물을 배송해 드릴게요!
        </p>
      </div>
      <Image src="/assets/images/login-image.png" alt="Laundry" width={390} height={308} />

      <KakaoLoginButton oauthUrl={url.toString()} />
    </main>
  );
}
