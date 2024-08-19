import DeliveryAddressItem from '@/components/delivery/DeliveryAddressItem';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { AddPlusIcon } from '@assets/icons';
import { Fragment, useRef, useState } from 'react';
import { response } from './dummydata';

export default function DeliveryAddressList() {
  const [value, setValue] = useState('1');
  const handleRadioChange = (value: string) => {
    setValue(value);
  };
  return (
    <Radio.Group value={value} onChange={handleRadioChange} size="big">
      {response.data.map((item, index) => (
        <Fragment key={item.addressId}>
          <div className="flex items-center gap-5">
            <Radio.Button value={item.addressId} />
            <DeliveryAddressItem item={item} selected isDefault={item.isDefault} />
          </div>
          {index !== response.data.length - 1 && <Separator variant="horizontal" />}
        </Fragment>
      ))}
    </Radio.Group>
  );
}
