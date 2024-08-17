'use client';

import Chip from '@/components/share/Chip/chip';
import Tag from '@/components/share/Tag';

interface DeliveryAddressItemProps {
  item: {
    name: string;
    address: string;
  };
  isDefault: boolean;
  selected: boolean;
}
export default function DeliveryAddressItem({ item, isDefault }: DeliveryAddressItemProps) {
  const handleRemoveClick = () => {
    console.log('remove');
  };
  const handleEditClick = () => {
    console.log('edit');
  };
  const handleDefaultClick = () => {
    console.log('default');
  };
  return (
    <div className="flex w-full items-center justify-between gap-4 py-4">
      <div className="flex w-full flex-col gap-1">
        <div className="flex gap-1.5">
          <p className="font-semibold text-label-strong font-body-1-normal">{item.name}</p>
          {isDefault && <Tag label="기본 배송지" color="blue" />}
        </div>
        <p className="font-normal text-label-normal font-label-1-normal">{item.address}</p>
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
