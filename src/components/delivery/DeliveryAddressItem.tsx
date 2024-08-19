'use client';

import { useRouter, usePathname } from 'next/navigation';
import Chip from '@/components/share/Chip/chip';
import Tag from '@/components/share/Tag';
import Link from 'next/link';
import { useEffect } from 'react';
import { getAddresses, getAddressesList } from '@/api/addressApi';
import { useSession } from 'next-auth/react';

interface DeliveryAddressItemProps {
  item: any;
  isDefault: boolean;
  selected: boolean;
}
export default function DeliveryAddressItem({ item, isDefault }: DeliveryAddressItemProps) {
  const router = useRouter();
  const pathname = usePathname();

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  console.log('access', accessToken);

  useEffect(() => {
    if (accessToken) {
      const fetchData = async () => {
        try {
          const data = await getAddresses(accessToken);
          console.log('data', data);
        } catch (error) {
          console.error('Error fetching address:', error);
        }
      };

      fetchData();
    }
  }, [accessToken]);

  const handleRemoveClick = () => {
    console.log('remove');
  };
  const handleEditClick = () => {
    const { addressId } = item;
    // router.push({
    //   pathname,
    //   query: {
    //     addressId,
    //   },
    // });
    router.push(`/address/edit/${addressId}`);
    console.log('edit');
  };
  const handleDefaultClick = () => {
    console.log('default');
  };
  return (
    <div className="flex w-full items-center justify-between gap-4 py-4">
      <div className="flex w-full flex-col gap-1">
        <div className="flex gap-1.5">
          <p className="font-semibold text-label-strong font-body-1-normal">{item.addressLabel}</p>
          {isDefault && <Tag label="기본 배송지" color="blue" />}
        </div>
        <p className="font-normal text-label-normal font-label-1-normal">{item.fullAddress}</p>
        <div className="flex gap-2">
          {/* <Link
            href={{
              pathname: '/address/[addressId]',
              query: { addressId: item.addressId },
            }}
          > */}
          <Chip text="수정" onClick={handleEditClick} />
          {/* </Link> */}

          {!isDefault && (
            <>
              <Chip text="삭제" onClick={handleRemoveClick} />
              <Chip text="기본 배송지로 변경" onClick={handleDefaultClick} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
