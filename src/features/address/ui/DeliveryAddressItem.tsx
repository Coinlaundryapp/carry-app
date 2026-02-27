'use client';

import { useRouter } from 'next/navigation';
import Chip from '@shared/ui/Chip/chip';
import Tag from '@shared/ui/Tag';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { deleteAddress, patchDefaultAddress } from '@features/address/api/addressApi';
import { useModalStore } from '@shared/model/modal-store';
import { useToastStore } from '@shared/model/toast-store';
import { useAddressStore } from '@features/address/model/address-store';
import type { AddressListItem } from '@features/address/types/address-type';

interface DeliveryAddressItemProps {
  item: AddressListItem;
  isDefault: boolean;
  selected: boolean;
}
export default function DeliveryAddressItem({ item, isDefault }: DeliveryAddressItemProps) {
  const router = useRouter();
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const openModal = useModalStore((state) => state.openModal);
  const addToast = useToastStore((state) => state.addToast);
  const triggerRefetch = useAddressStore((state) => state.triggerRefetch);

  const { mutate } = useMutation({
    mutationFn: ({
      accessToken,
      addressId,
    }: {
      accessToken: string;
      addressId: string | string[];
    }) => deleteAddress(accessToken, addressId),
    onSuccess: () => {
      triggerRefetch();
      addToast({ message: '배송지가 삭제되었습니다.', type: 'success' });
    },
  });

  const patchDefaultAddressMutate = useMutation({
    mutationFn: ({
      accessToken,
      addressId,
    }: {
      accessToken: string;
      addressId: string | string[];
    }) => patchDefaultAddress(accessToken, addressId),
    onSuccess: () => {
      triggerRefetch();
      addToast({ message: '기본 배송지가 변경되었습니다.', type: 'success' });
    },
  });

  const handleRemoveClick = () => {
    openModal({
      title: '배송지를 삭제하시겠어요?',
      confirmText: '확인',
      closeText: '취소',
      type: 'confirm',
      onConfirm: () => {
        const addressId = String(item.addressId);
        if (accessToken) {
          mutate({ accessToken, addressId });
        }
      },
    });
  };
  const handleEditClick = () => {
    const { addressId } = item;
    router.push(`/address/edit/${addressId}`);
  };

  const handleDefaultClick = () => {
    openModal({
      title: '기본 배송지를 변경하시겠어요?',
      confirmText: '확인',
      closeText: '취소',
      type: 'confirm',
      onConfirm: () => {
        const addressId = String(item.addressId);
        if (accessToken && addressId) {
          patchDefaultAddressMutate.mutate({ accessToken, addressId });
        }
      },
    });
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
    </div>
  );
}
