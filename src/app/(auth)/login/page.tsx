import Image from 'next/image';
import Link from 'next/link';
import { KakaoIcon } from '@assets/icons';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY as string;
const KAKAO_REDIRECT_URL = process.env.KAKAO_REDIRECT_URL as string;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
export default async function Login() {
  const url = new URL(KAKAO_REDIRECT_URL);
  url.searchParams.append('client_id', KAKAO_REST_API_KEY);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', NEXT_PUBLIC_BASE_URL + '/api/kakao');
  return (
    <main className="flex flex-col items-center gap-10 px-4 pt-[84px] text-center">
      <div>
        <p className="font-bold text-label-strong font-title-1">
          원하는 시간에 <span className="text-primary-normal">맡기고</span>
        </p>
        <p className="mb-2 font-bold text-label-strong font-title-1">
          원하는 시간에 <span className="text-primary-normal">맡기고</span>
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
        href={url}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FEE500] p-4 font-bold font-body-1-reading"
        type="submit"
      >
        <KakaoIcon />
        <p>카카오로 시작하기</p>
      </Link>
    </main>
  );
}
