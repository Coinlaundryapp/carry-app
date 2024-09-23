import Link from 'next/link';
import Button from '@/components/share/Button';
import { ModalOkIcon } from '@assets/icons';

export default function SuccessPage() {
  return (
    <main className="flex h-svh flex-col items-center justify-between gap-[108px] px-6">
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
