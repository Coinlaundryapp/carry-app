'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AddressRequest from '@features/address/ui/AddressRequest';
import { TopNavigation } from '@shared/ui/TopNavigation';
import EntrancePassword from '@features/address/ui/EntrancePassword';
import Button from '@shared/ui/Button';

export default function AddressRequestEditPage({
  params,
}: Readonly<{
  params: {
    addressId: number;
  };
}>) {
  const router = useRouter();
  const addressId = params.addressId;
  const [selectedRequest, setSelectedRequest] = useState({ value: '', requestText: '' });
  const [selectedValue, setSelectedValue] = useState({
    value: '1',
    text: '',
  });
  const handleChange = (value: string) => {
    setSelectedValue((pre) => ({ ...pre, value }));
  };
  const handleChangeRequest = (value: string) => {
    setSelectedRequest((pre) => ({ ...pre, value }));
  };
  const handleExtraInfoChange = (text: string) => {
    setSelectedValue((pre) => ({ ...pre, text }));
  };

  return (
    <main className="relative h-dvh w-full">
      <TopNavigation type="back" title="배송지 요청사항" leftClick={() => router.back()} />
      <div className="px-6 pt-4">
        <AddressRequest
          key={5}
          handleChangeRequest={handleChangeRequest}
          onChangeRequestText={handleExtraInfoChange}
          selectedRequest={selectedRequest}
        />
        <EntrancePassword
          key={4}
          onChange={handleChange}
          entranceValue={selectedValue}
          onExtraInfoChange={handleExtraInfoChange}
        />
      </div>
      <div className="shadow-emphasize absolute bottom-0 w-full bg-white p-6">
        <Button state="fillPrimary" size="full">
          수정하기
        </Button>
      </div>
    </main>
  );
}
