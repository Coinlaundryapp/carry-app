import DeliveryAddressItem from '@/components/delivery/DeliveryAddressItem';
import { Radio } from '@/components/share/Radio';
import Separator from '@/components/share/Separator/Separator';
import { AddPlusIcon } from '@assets/icons';
import { Fragment, useRef, useState } from 'react';
import { response } from './dummydata';
import { useQuery } from '@tanstack/react-query';
import { getAddresses } from '@/api/addressApi';
import { useSession } from 'next-auth/react';

export default function DeliveryAddressList({ addressList }: any) {
  const [value, setValue] = useState('1');

  const handleRadioChange = (value: string) => {
    setValue(value);
  };

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  console.log('access', accessToken);

  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses', accessToken],
    queryFn: () => getAddresses(accessToken),
    enabled: !!accessToken,
  });
  return (
    <Radio.Group value={value} onChange={handleRadioChange} size="big">
      {response.data.map((item: any, index: number) => (
        <Fragment key={item.addressId}>
          <div className="flex items-center gap-5">
            <Radio.Button value={item.addressId} />
            <DeliveryAddressItem item={item} selected isDefault={item.isDefault} />
          </div>
          {index !== data.length - 1 && <Separator variant="horizontal" />}
        </Fragment>
      ))}
    </Radio.Group>
  );
}
