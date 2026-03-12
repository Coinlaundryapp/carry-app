import React from 'react';
import Dropdown from '@shared/ui/Dropdown/Dropdown';
import { Input } from '@shared/ui/Input';
import { REQUEST_OPTIONS } from '@features/address/lib/request-options';
import { TSelectedRequest } from '@features/address/lib/useAddressForm';

type TProps = {
  selectedRequest: TSelectedRequest;
  handleChangeRequest: (value: string) => void;
  onChangeRequestText: (text: string) => void;
};

function AddressRequest({ onChangeRequestText, selectedRequest, handleChangeRequest }: TProps) {
  return (
    <div className="mb-6 w-full">
      <label className="font_headline_1 font-semibold">배송 요청사항</label>
      <div className="mt-3">
        <Dropdown
          data={REQUEST_OPTIONS}
          value={selectedRequest.value}
          indicator="radio"
          placeholder="문 앞에 놓아 주세요."
          onChange={handleChangeRequest}
        />
      </div>

      {selectedRequest.value === '4' && (
        <Input
          className="mb-4 mt-3"
          status="primary"
          type="text"
          placeholder="내용을 자세히 입력해주세요."
          value={selectedRequest.requestText}
          onChange={(e) => onChangeRequestText(e.currentTarget.value)}
        />
      )}
    </div>
  );
}

export default AddressRequest;
