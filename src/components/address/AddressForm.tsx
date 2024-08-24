'use clinet';
import React from 'react';
import { Input } from '../share/Input';
import { useAddressStore } from '@/store/address-store';

interface Address {
  main: string;
  detail: string;
}
type TProps = {
  address: Address;
  setAddress: React.Dispatch<Address>;
};

const AddressForm = ({ address, setAddress }: TProps) => {
  const { setAddressModalOpen } = useAddressStore();
  return (
    <div className="mb-6">
      <Input
        onClick={() => setAddressModalOpen(true)}
        type="text"
        title="배송 받으실 주소"
        fontStyle=" font_headline_1 font-semibold "
        value={address.main}
        placeholder="건물, 지번 또는 도로명 검색"
        status="primary"
        className="mb-2"
        readOnly
      />
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
