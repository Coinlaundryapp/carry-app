import { auth } from '@features/auth/api/auth';
import Link from 'next/link';

export default async function UserInfo() {
  const session = await auth();
  if (!session) {
    return (
      <Link href="/login/my" className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-600" />
        <div>
          <p className="font-semibold text-black font-headline-2">로그인 및 회원가입</p>
          <p className="font-medium text-label-alternative font-body-2-normal">
            더 이상 세탁 시간을 기다리지 마세요!
          </p>
        </div>
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 rounded-full bg-gray-600" />
      <div>
        <p className="font-normal font-body-2-normal">안녕하세요!</p>
        <p className="font-semibold text-black font-heading-1">02** 님</p>
      </div>
    </div>
  );
}
