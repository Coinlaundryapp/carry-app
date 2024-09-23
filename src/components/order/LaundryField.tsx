import Link from 'next/link';
import { ChevronRightIcon } from '@assets/icons';

export default function LaundryField() {
  return (
    <section className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-label-strong font-headline-1">
          세탁소 선택하기 <span className="text-status-destructive">*</span>
        </h2>
        <Link href="#">
          <ChevronRightIcon />
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-semibold text-label-strong font-body-1-normal">세탁소 정보</p>
        <p className="font-semibold text-label-strong font-label-2">소금이 세탁소</p>
      </div>
    </section>
  );
}
