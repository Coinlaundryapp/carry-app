'use client';
import React, { useState, useEffect } from 'react';
import RenderStepContent from '../RenderStepContent';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';
import SearchForm from '@/components/address/SearchForm';

export const REQUES_OPTIONS = [
  { value: '1', label: '문 앞에 놓아주세요.' },
  { value: '2', label: '경비실에 맡겨 주세요' },
  { value: '3', label: '택배함에 넣어 주세요.' },
  { value: '4', label: '직접 입력' },
];

const EditFormPage = ({ renderAllAtOnce = false }) => {
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
    setSelectedValue((pre) => ({ ...pre, value }));
  };

  const handleMainAdressChange = (value: string) => {
    setAddress((pre) => ({ ...pre, main: value }));
  };

  const handleExtraInfoChange = (text: string) => {
    setSelectedValue((pre) => ({ ...pre, text }));
  };

  const handleNext = () => {
    if (isValid) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleChangeRequest = (value: string) => {
    setSelectedRequest((pre) => ({ ...pre, value }));
  };

  const handleChangeRequestText = (requestText: string) => {
    setSelectedRequest((pre) => ({ ...pre, requestText }));
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

  return (
    <div className="flex h-full w-full flex-col overflow-scroll pb-16">
      {addressModalOpen ? (
        <div className="relative z-50 max-h-full w-full max-w-full overflow-hidden bg-white">
          <SearchForm onAddressChange={handleMainAdressChange} />
        </div>
      ) : (
        <>
          <div className="p-4">
            <RenderStepContent
              step={step}
              formData={formData}
              setFormData={setFormData}
              address={address}
              setAddress={setAddress}
              selectedValue={selectedValue}
              handleChange={handleChange}
              handleExtraInfoChange={handleExtraInfoChange}
              selectedRequest={selectedRequest}
              handleChangeRequest={handleChangeRequest}
              onChangeRequestText={handleChangeRequestText}
              setSelectedRequest={setSelectedRequest}
              renderSteps={[1, 2, 3, 4, 5]}
              renderAllAtOnce={true}
            />
          </div>

          <div className="absolute bottom-0 flex w-full justify-center bg-white p-4">
            <AddressButton
              onClick={handleConfirm}
              className={allStepsValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
              disabled={!allStepsValid}
            >
              저장
            </AddressButton>
          </div>
        </>
      )}
    </div>
  );
};

export default EditFormPage;
