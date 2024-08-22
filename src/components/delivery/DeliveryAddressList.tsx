import DeliveryAddressItem from '@/components/delivery/DeliveryAddressItem';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { AddPlusIcon } from '@assets/icons';
import { Fragment, useState } from 'react';

export default function DeliveryAddressList({ addressList }: any) {
  const [value, setValue] = useState(1);

  const handleRadioChange = (value: number) => {
    setValue(value);
  };

  return (
    <Radio.Group value={value} onChange={handleRadioChange} size="big">
      {addressList.map((item: any, index: number) => (
        <Fragment key={item.addressId}>
          <div className="flex items-center gap-5">
            <Radio.Button value={item.addressId} />
            <DeliveryAddressItem item={item} selected isDefault={item.isDefault} />
          </div>
          {index !== addressList.length - 1 && <Separator variant="horizontal" />}
        </Fragment>
      ))}
    </Radio.Group>
  );
}
