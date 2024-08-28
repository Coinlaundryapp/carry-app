import DeliveryAddressItem from './DeliveryAddressItem';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { Fragment, useMemo, useState } from 'react';

type TProps = {
  addressList: any;
};

export default function DeliveryAddressList({ addressList }: TProps) {
  const [value, setValue] = useState('1');

  const handleRadioChange = (value: string) => {
    setValue(value);
  };

  const sortedAddressList = useMemo(() => {
    return [...addressList].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }, [addressList]);

  return (
    <Radio.Group value={value} onChange={handleRadioChange} size="big">
      {sortedAddressList.map((item: any, index: number) => (
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
