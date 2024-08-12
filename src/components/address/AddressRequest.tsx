import React from 'react';
import Dropdown from '../share/Dropdown/Dropdown';
import { REQUES_OPTIONS } from '@/app/(fullscreen)/address/constants/request-options';
import { Input } from '../share/Input';

type TProps = {
  selectedRequest: any;
  handleChangeRequest: any;
  setSelectedRequest: any;
};

function AddressRequest({ selectedRequest, handleChangeRequest, setSelectedRequest }: TProps) {
  return (
    <div className="mb-4">
      <label className="font_headline_1 mb-4 font-bold">배송 요청사항</label>
      <Dropdown
        data={REQUES_OPTIONS}
        value={selectedRequest.value}
        indicator="radio"
        placeholder="문 앞에 놓아 주세요."
        onChange={handleChangeRequest}
      />
      {selectedRequest.value === '4' && (
        <Input
          className="mb-4 mt-3"
          status="primary"
          type="text"
          // fontStyle="strong"
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
