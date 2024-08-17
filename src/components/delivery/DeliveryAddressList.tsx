import DeliveryAddressItem from '@/components/delivery/DeliveryAddressItem';
import Button from '@/components/share/Button';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { AddPlusIcon } from '@assets/icons';
import { Fragment, useRef, useState } from 'react';

const DATA = [
  {
    id: '1',
    name: '홍길동',
    address: '서울시 강남구 역삼동 123-456',
  },
  {
    id: '2',
    name: '김철수',
    address: '서울시 강북구 번동 789-123',
  },
  {
    id: '3',
    name: '이영희',
    address: '서울시 강동구 천호동 321-654',
  },
];
export default function DeliveryAddressList() {
  const [value, setValue] = useState('1');
  const handleRadioChange = (value: string) => {
    setValue(value);
  };
  return (
    <Radio.Group value={value} onChange={handleRadioChange} size="big">
      {DATA.map((item, index) => (
        <Fragment key={item.id}>
          <div className="flex items-center gap-5">
            <Radio.Button value={item.id} />
            <DeliveryAddressItem item={item} selected isDefault={item.id === '1'} />
          </div>
          {index !== DATA.length - 1 && <Separator variant="horizontal" />}
        </Fragment>
      ))}
    </Radio.Group>
  );
}
