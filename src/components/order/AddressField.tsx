import Link from 'next/link';
import Tag from '@/components/share/Tag';
import { ChevronRightIcon, EllipseIcon } from '@assets/icons';

export default function AddressField({ addressId }: Readonly<{ addressId: string }>) {
  // const address = null;
  const address = {
    addressLabel: '우리집',
    recipientPhone: '010-1234-2352',
    recipientName: '함정훈',
    baseAddress: '서울특별시 용산구 서빙고로 4-2 (한강로3가)',
    detailAddress: '106동 1902호',
    deliveryNotes: '조심히 수거해주세요',
    entranceType: 'OTHER',
    entranceDetail: '뒤쪽 문은 항상 열려있습니다',
  };
  return (
    <section className="p-5">
      <h2 className="font-semibold text-label-strong font-headline-1">
        배송지 정보 <span className="text-status-destructive">*</span>
      </h2>
      {address ? (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-label-normal font-headline-1">
                {address.addressLabel}
              </p>
              <Tag label="기본 배송지" color="blue" />
            </div>
            <Link
              href="/address/list"
              className="rounded-sm bg-primary-normal px-1.5 py-1 font-semibold text-static-white font-label-1-normal"
            >
              변경
            </Link>
          </div>
          <div className="flex items-center gap-2 font-semibold text-label-neutral font-body-1-normal">
            <p>{address.recipientName}</p>
            <EllipseIcon />
            <p className="font-medium">{address.recipientPhone}</p>
          </div>
          <p className="font-medium text-label-neutral font-label-1-normal">
            {address.baseAddress}
          </p>
        </div>
      ) : (
        <Link href="/address/list" className="mt-4 flex w-full items-center justify-between">
          <p className="font-semibold text-label-neutral font-body-1-normal">
            배송지를 입력해 주세요
          </p>
          <ChevronRightIcon />
        </Link>
      )}
    </section>
  );
}
