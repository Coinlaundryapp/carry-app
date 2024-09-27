import Link from 'next/link';
import Separator from '@/components/share/Separator/Separator';
import { ChevronRightIcon } from '@assets/icons';
import { Address } from '@/types/api-types';
import { TLaundromats } from '@/types/map-type';

export default function LaundryField({
  address,
  laundryromat,
}: {
  address: Address | null;
  laundryromat: TLaundromats | null;
}) {
  if (!address) {
    return null;
  }
  return (
    <>
      <section className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-label-strong font-headline-1">
            세탁소 선택하기 <span className="text-status-destructive">*</span>
          </h2>
          <Link href="/map/order">
            <ChevronRightIcon />
          </Link>
        </div>
        {laundryromat && (
          <div className="mt-6 flex items-center justify-between">
            <p className="font-semibold text-label-strong font-body-1-normal">세탁소 정보</p>
            <p className="font-semibold text-label-strong font-label-2">{laundryromat.name}</p>
          </div>
        )}
      </section>
      <Separator variant="horizontal8" />
    </>
  );
}
