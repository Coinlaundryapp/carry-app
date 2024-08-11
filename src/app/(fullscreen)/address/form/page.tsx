'use client';
import React, { useState, useEffect } from 'react';
import AddressForm from '@/components/address/AddressForm';
import EntrancePassword from '@/components/address/EntrancePassword';
import Button from '@/components/share/Button';
import { Input } from '@/components/share/Input';
import Dropdown from '@/components/share/Dropdown/Dropdown';
import SearchForm from '@/components/address/SearchForm';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';

const REQUES_OPTIONS = [
  { value: '1', label: '문 앞에 놓아주세요.' },
  { value: '2', label: '경비실에 맡겨 주세요' },
  { value: '3', label: '택배함에 넣어 주세요.' },
  { value: '4', label: '직접 입력' },
];

const AddressFormpage = () => {
  const { addressModalOpen } = useAddressStore();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ main: '', detail: '' });
  const [selectedValue, setSelectedValue] = useState({
    value: '1',
    text: '',
  });
  const [selectedRequest, setSelectedRequest] = useState({ value: '1', requestText: '' });
  const [isValid, setIsValid] = useState<boolean>(false);
  const [allStepsValid, setAllStepsValid] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleChange = (value: string) => {
    setSelectedValue((pre) => ({ ...pre, value: value }));
  };

  const handleMainAdressChange = (value: string) => {
    setAddress((pre) => ({ ...pre, main: value }));
  };

  const handleExtraInfoChange = (text: string) => {
    setSelectedValue((pre) => ({ ...pre, text: text }));
  };

  const handleNext = () => {
    if (isValid) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleChangeRequest = (value: string) => {
    setSelectedRequest((pre) => ({ ...pre, value }));
  };

  const handleConfirm = () => {
    if (allStepsValid) {
      alert('주소가 확인되었습니다!');
    }
  };

  useEffect(() => {
    validateForm();
    validateAllSteps();
  }, [step, formData, address, selectedValue, selectedRequest]);

  const validateForm = () => {
    switch (step) {
      case 1:
        setIsValid(formData.name.trim() !== '');
        break;
      case 2:
        setIsValid(address.main.trim() !== '' && address.detail.trim() !== '');
        break;
      case 3:
        if (selectedValue.value === '1' || selectedValue.value === '5') {
          setIsValid(selectedValue.text.trim() !== '');
        } else {
          setIsValid(selectedValue.value.trim() !== '');
        }
        break;
      case 4:
        if (selectedRequest.value === '4') {
          setIsValid(selectedRequest.requestText.trim() !== '');
        } else {
          setIsValid(selectedRequest.value.trim() !== '');
        }
        break;
      case 5:
        setIsValid(/^01[0-9]{8,9}$/.test(formData.phone));
        break;
      default:
        setIsValid(true);
    }
  };

  const validateAllSteps = () => {
    const allValid =
      formData.name.trim() !== '' &&
      address.main.trim() !== '' &&
      address.detail.trim() !== '' &&
      (selectedValue.value === '1' || selectedValue.value === '5'
        ? selectedValue.text.trim() !== ''
        : selectedValue.value.trim() !== '') &&
      (selectedRequest.value === '4'
        ? selectedRequest.requestText.trim() !== ''
        : selectedRequest.value.trim() !== '') &&
      /^01[0-9]{8,9}$/.test(formData.phone);
    setAllStepsValid(allValid);
  };

  const renderStepContent = () => {
    return (
      <>
        {step >= 5 && (
          <Input
            className="mb-4"
            status="primary"
            type="text"
            title="전화번호"
            fontStyle="strong"
            placeholder="전화번호를 입력해주세요."
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        )}
        {step >= 4 && (
          <div className="mb-4">
            <label className="font-bold">배송 요청사항</label>
            <Dropdown
              data={REQUES_OPTIONS}
              value={selectedRequest.value}
              indicator="radio"
              placeholder="문 앞에 놓아 주세요."
              onChange={handleChangeRequest}
            />
            {selectedRequest.value === '4' && (
              <Input
                className="mb-4 mt-4"
                status="primary"
                type="text"
                fontStyle="strong"
                placeholder="내용을 자세히 입력해주세요."
                value={selectedRequest.requestText}
                onChange={(e) =>
                  setSelectedRequest({ ...selectedRequest, requestText: e.target.value })
                }
              />
            )}
          </div>
        )}
        {step >= 3 && (
          <EntrancePassword
            onChange={handleChange}
            entranceValue={selectedValue}
            onExtraInfoChange={handleExtraInfoChange}
          />
        )}
        {step >= 2 && <AddressForm address={address} setAddress={setAddress} />}
        {step >= 1 && (
          <Input
            className="mb-4"
            status="primary"
            type="text"
            title="받는 분"
            fontStyle="strong"
            placeholder="받는 분 성함을 입력해주세요."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-scroll pb-16">
      {addressModalOpen ? (
        <div className="relative z-50 max-h-full w-full max-w-full overflow-hidden bg-white">
          <SearchForm onAddressChange={handleMainAdressChange} />
        </div>
      ) : (
        <>
          <div className="p-4">{renderStepContent()}</div>

          {step < 5 && (
            <div className="shadow-top absolute bottom-0 flex w-full justify-center bg-white p-4">
              <AddressButton
                className={isValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
                onClick={handleNext}
                disabled={!isValid}
              >
                다음
              </AddressButton>
            </div>
          )}
          {step >= 5 && (
            <div className="absolute bottom-0 flex w-full justify-center bg-white">
              <AddressButton
                onClick={handleConfirm}
                className={allStepsValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
                // state={allStepsValid ? 'fillPrimary' : 'fillSecondary'}
                disabled={!allStepsValid}
              >
                추가하기
              </AddressButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressFormpage;
