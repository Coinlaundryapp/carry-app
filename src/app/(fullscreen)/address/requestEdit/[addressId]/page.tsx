'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AddressRequest from '@/components/address/AddressRequest';
import { TopNavigation } from '@/components/share/TopNavigation';
import EntrancePassword from '@/components/address/EntrancePassword';
import Button from '@/components/share/Button';

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
          setSelectedRequest={setSelectedRequest}
          selectedRequest={selectedRequest}
        />
        <EntrancePassword
          key={4}
          onChange={handleChange}
          entranceValue={selectedValue}
          onExtraInfoChange={handleExtraInfoChange}
        />
      </div>
      <div className="absolute bottom-0 w-full bg-white p-6 shadow-emphasize">
        <Button state="fillPrimary" size="full">
          수거 신청하기
        </Button>
      </div>
    </main>
  );
}
