'use client';
import React, { useState, useEffect } from 'react';
import RenderStepContent from '../RenderStepContent';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';
import SearchForm from '@/components/address/SearchForm';
import { validateAllSteps, validateForm } from '../validations/addressValidaton';

const EditFormPage = () => {
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
    const validationInput = { step, formData, address, selectedValue, selectedRequest };
    setIsValid(validateForm(validationInput));
    setAllStepsValid(validateAllSteps(validationInput));
  }, [step, formData, address, selectedValue, selectedRequest]);

 

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
