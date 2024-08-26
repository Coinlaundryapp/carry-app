import React from 'react';
import Dropdown from '../share/Dropdown/Dropdown';
import { Input } from '../share/Input';
import { REQUEST_OPTIONS } from '@/constants/request-options';

type TProps = {
  selectedRequest: any;
  handleChangeRequest: any;
  setSelectedRequest: any;
};

function AddressRequest({ selectedRequest, handleChangeRequest, setSelectedRequest }: TProps) {
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
          onChange={(e) =>
            setSelectedRequest({ ...selectedRequest, requestText: e.currentTarget.value })
          }
        />
      )}
    </div>
  );
}

export default AddressRequest;
