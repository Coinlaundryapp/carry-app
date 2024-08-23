'use client';

import { useRouter, usePathname } from 'next/navigation';
import Chip from '@/components/share/Chip/chip';
import Tag from '@/components/share/Tag';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteAddress } from '@/api/addressApi';
import { Modal } from '../share/Modal';
import { useModalStore } from '@/store/modal-store';
import { useToastStore } from '@/store/toast-store';
interface DeliveryAddressItemProps {
  item: any;
  isDefault: boolean;
  selected: boolean;
  addressRefetch: () => void;
}
export default function DeliveryAddressItem({
  item,
  isDefault,
  addressRefetch,
}: DeliveryAddressItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const openModal = useModalStore((state) => state.openModal);
  const addToast = useToastStore((state) => state.addToast);

  const { mutate } = useMutation({
    mutationFn: ({
      accessToken,
      addressId,
    }: {
      accessToken: string;
      addressId: string | string[];
    }) => deleteAddress(accessToken, addressId),
    onSuccess: (data) => {
      console.log('data', data);
      addressRefetch();
      addToast({ message: '배송지가 삭제되었습니다.', type: 'success', duration: 2000 });
      // router.push('/address/list');
    
    },
  });

  const handleRemoveClick = () => {
    setIsOpen(true);
    openModal({
      title: '배송지를 삭제하시겠어요?',
      confirmText: '확인',
      closeText: '취소',
      type: 'confirm',
      onConfirm: () => {
        const { addressId } = item;
        if (accessToken) {
          mutate({ accessToken, addressId });
        }
      },
    });
  };
  const handleEditClick = () => {
    const { addressId } = item;
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
          <Chip text="수정" onClick={handleEditClick} />

          {!isDefault && (
            <>
              <Chip text="삭제" onClick={handleRemoveClick} />
              <Chip text="기본 배송지로 변경" onClick={handleDefaultClick} />
            </>
          )}
        </div>
      </div>
      {isOpen && <Modal />}
    </div>
  );
}
