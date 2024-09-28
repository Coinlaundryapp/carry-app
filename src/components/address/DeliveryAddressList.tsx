import DeliveryAddressItem from './DeliveryAddressItem';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { useAddressStore } from '@/store/address-store';
import { GetAddressesResType } from '@/types/address-type';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useMemo } from 'react';

type TProps = {
  addressList: GetAddressesResType;
};

export default function DeliveryAddressList({ addressList }: TProps) {
  const router = useRouter();
  const { selectedAddressId, setSelectedAddressId } = useAddressStore();
  const handleRadioChange = (value: number | string | null) => {
    if (typeof value === 'number') {
      setSelectedAddressId(value);
      router.back();
    }
  };

  const sortedAddressList = useMemo(() => {
    return [...addressList].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }, [addressList]);
  useEffect(() => {
    if (selectedAddressId === null && sortedAddressList.length > 0) {
      setSelectedAddressId(
        sortedAddressList.find((item) => item.isDefault)?.addressId ||
          sortedAddressList[0].addressId,
      );
    }
  }, [selectedAddressId, setSelectedAddressId, sortedAddressList]);

  return (
    <Radio.Group value={selectedAddressId} onChange={handleRadioChange} size="big">
      {sortedAddressList.map((item, index: number) => (
        <Fragment key={item.addressId}>
          <div className="flex items-center gap-2">
            <Radio.Button value={item.addressId} />
            <DeliveryAddressItem item={item} selected isDefault={item.isDefault} />
          </div>
          {index !== sortedAddressList.length - 1 && <Separator variant="horizontal" />}
        </Fragment>
      ))}
    </Radio.Group>
  );
}
