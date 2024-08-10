'use client';
import React, { useState } from 'react';
import { Input } from '@/components/share/Input';
import { SearchIcon } from '@assets/icons';
import { useRouter } from 'next/navigation';
import { useAddressStore } from '@/store/address-store';

interface Address {
  main: string;
  sub: string;
}

function SearchForm() {
  const [value, setValue] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter();
  const setSelectedAddress = useAddressStore((state) => state.setSelectedAddress);

  const DUMMYDATA_ADDRESS: Address[] = [
    {
      main: '서울특별시 용산구 서빙고로 4-2 (한강로3가)',
      sub: '서울특별시 한강로3가 44-7',
    },
    {
      main: '서울특별시 용산구 서빙고로 4-4 (한강로3가)',
      sub: '서울특별시 한강로3가 44-8',
    },
    {
      main: '서울특별시 용산구 서빙고로 4-6 (한강로3가)',
      sub: '서울특별시 한강로3가 45-1',
    },
    {
      main: '서울특별시 용산구 서빙고로 4-8 (한강로3가)',
      sub: '서울특별시 한강로3가 45-2',
    },
  ];

  const handleClick = (address: Address) => {
    setValue(address.main);
    setSelectedAddress(address.main);
    router.push('/address/form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    if (inputValue) {
      const filteredAddresses = DUMMYDATA_ADDRESS.filter((address) =>
        address.main.includes(inputValue),
      );
      setAddresses(filteredAddresses);
    } else {
      setAddresses([]);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <SearchIcon className="absolute left-6 top-9 -translate-y-1/2 transform" />
      <Input
        type="text"
        fontStyle="strong"
        onChange={handleChange}
        value={value}
        placeholder="건물, 지번 또는 도로명 검색"
        status="primary"
        iconstate="pl-4"
        className="relative p-4"
      />

      <div className="h-2 w-full bg-cool-neutral-99" />
      {addresses.map((address, index) => (
        <div
          onClick={() => handleClick(address)}
          key={index}
          className="flex cursor-pointer flex-col gap-2 p-4"
        >
          <div className="border-b border-cool-neutral-99 pb-4">
            <p>{address.main}</p>

            <p className="flex items-center justify-start gap-2 text-sm text-gray-500">
              <span className="font_caption_2 rounded-sm border border-cool-neutral-80 p-0.5 text-cool-neutral-80">
                지번
              </span>
              {address.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchForm;
