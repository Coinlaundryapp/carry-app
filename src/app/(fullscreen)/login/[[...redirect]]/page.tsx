import Image from 'next/image';
import Link from 'next/link';
import { KakaoIcon } from '@assets/icons';
import { headers } from 'next/headers';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY as string;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL as string;

export default async function Login({
  params,
  searchParams,
}: {
  params: { redirect: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const url = new URL(KAKAO_REDIRECT_URL);
  const redirect = params.redirect;
  const headersList = headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const BASE_URL = `${protocol}://${host}`;

  // state 파라미터 생성
  const state = {
    redirect,
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

      <Link
        href={url.toString()}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold font-body-1-reading"
        type="submit"
      >
        <KakaoIcon />
        <p>카카오로 시작하기</p>
      </Link>
    </main>
  );
}
