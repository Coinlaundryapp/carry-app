import Link from 'next/link';
import Tag from '@shared/ui/Tag';
import Separator from '@shared/ui/Separator/Separator';
import { ChevronRightIcon, EllipseIcon } from '@assets/icons';
import { TAddressRes } from '@shared/types/api-types';

export default function AddressField({ address }: { address: TAddressRes | undefined }) {
  return (
    <>
      <section className="p-5">
        <h2 className="text-label-strong font-headline-1 font-semibold">배송지 정보</h2>
        {address ? (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-label-normal font-headline-1 font-semibold">
                  {address.addressLabel}
                </p>
                {address.isDefaultAddress && <Tag label="기본 배송지" color="blue" />}
              </div>
              <Link
                href="/address/list"
                className="bg-primary-normal text-static-white font-label-1-normal rounded-sm px-1.5 py-1 font-semibold"
              >
                변경
              </Link>
            </div>
            <div className="text-label-neutral font-body-1-normal flex items-center gap-2 font-semibold">
              <p>{address.recipientName}</p>
              <EllipseIcon />
              <p className="font-medium">{address.recipientPhone}</p>
            </div>
            <p className="text-label-neutral font-label-1-normal font-medium">
              {address.baseAddress} {address.detailAddress}
            </p>
          </div>
        ) : (
          <Link href="/address/list" className="mt-4 flex w-full items-center justify-between">
            <p className="text-label-neutral font-body-1-normal font-semibold">
              배송지를 입력해 주세요
            </p>
            <ChevronRightIcon />
          </Link>
        )}
      </section>
      <Separator variant="horizontal8" />
      {address && (
        <>
          <section className="p-5">
            <div className="flex w-full justify-between">
              <h2 className="text-label-strong font-headline-1 font-semibold">배송 요청사항</h2>
              <Link href={`/address/requestEdit/${address.id}`}>
                <ChevronRightIcon />
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <p className="text-primary-normal font-label-1-normal font-semibold">
                배송시 요청사항
              </p>
              <p className="text-label-neutral font-label-1-normal font-medium">
                {address.deliveryNotes ? address.deliveryNotes : '요청사항 없음'}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-primary-normal font-label-1-normal font-semibold">
                공동현관 비밀번호
              </p>
              <p className="text-label-neutral font-label-1-normal font-medium">
                {address.entranceDetail ? address.entranceDetail : '요청 사항 없음'}
              </p>
            </div>
          </section>
          <Separator variant="horizontal8" />
        </>
      )}
    </>
  );
}
