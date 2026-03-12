import Link from 'next/link';
import Separator from '@shared/ui/Separator/Separator';
import { ChevronRightIcon } from '@assets/icons';
import { TAddressRes } from '@shared/types/api-types';
import { TLaundromats } from '@features/map/types/map-type';

export default function LaundryField({
  address,
  laundromat,
}: Readonly<{
  address: TAddressRes | undefined;
  laundromat: TLaundromats | null;
}>) {
  if (!address) {
    return null;
  }
  return (
    <>
      <section className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-label-strong font-headline-1 font-semibold">세탁소 선택하기</h2>
          <Link href="/map/order">
            <ChevronRightIcon />
          </Link>
        </div>
        {laundromat && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-label-strong font-body-1-normal font-semibold">세탁소 정보</p>
            <p className="text-label-strong font-label-2 font-semibold">{laundromat.name}</p>
          </div>
        )}
      </section>
      <Separator variant="horizontal8" />
    </>
  );
}
