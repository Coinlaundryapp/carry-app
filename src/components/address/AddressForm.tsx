'use clinet';
import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { Input } from '../share/Input';

import Link from 'next/link';

interface Address {
  main: string;
  detail: string;
}
type TProps = {
  address: Address;
  setAddress: React.Dispatch<Address>;
};

const AddressForm = ({ address, setAddress }: TProps) => {
  const [showPostcode, setShowPostcode] = useState<boolean>(false);

  const handleAddressComplete = (data: any) => {
    const roadAddress = data.roadAddress;
    setAddress({ ...address, main: roadAddress });
    setShowPostcode(false);
  };

  return (
    <div className="mb-4">
      <Link href="/address/searchform">
        <Input
          type="text"
          title="배송 받으실 주소"
          fontStyle="strong"
          value={address.main}
          placeholder="건물, 지번 또는 도로명 검색"
          status="primary"
          className="mb-2"
          readOnly
        />
      </Link>

      {showPostcode && (
        <div className="relative">
          <DaumPostcode
            onComplete={handleAddressComplete}
            className="z-100 h-400 absolute left-0 top-0 w-full"
            autoClose={false}
            defaultQuery=""
          />
        </div>
      )}
      <Input
        type="text"
        value={address.detail}
        onChange={(e) => setAddress({ ...address, detail: e.target.value })}
        placeholder="상세 주소 입력"
        status="primary"
        className=""
      />
    </div>
  );
};

export default AddressForm;
