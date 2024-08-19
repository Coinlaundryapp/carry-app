'use client';
import React, { useState, useEffect } from 'react';
import RenderStepContent from '../../RenderStepContent';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';
import SearchForm from '@/components/address/SearchForm';
import { validateAllSteps, validateForm } from '@/validations/addressValidation';
import { REQUEST_OPTIONS } from '@/constants/request-options';
import { useParams } from 'next/navigation';

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
    addressLabel: '',
    name: '',
    phone: '',
  });

  const { addressId } = useParams();

  console.log('sear', addressId);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');

    if (value.length > 3 && value.length <= 7) {
      value = value.replace(/(\d{3})(\d+)/, '$1-$2');
    } else if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }

    setFormData({ ...formData, phone: value });
  };

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
    let addressRequest = '';
    if (selectedRequest.value === '4') {
      addressRequest = selectedRequest.requestText;
    } else {
      const selectedOption = REQUEST_OPTIONS.find(
        (option) => option.value === selectedRequest.value,
      );
      addressRequest = selectedOption ? selectedOption.label : '';
    }

    const editAddress = {
      addressLabe: formData.addressLabel,
      recipientPhone: formData.phone,
      recipientName: formData.name,
      baseAddress: address.main,
      detailAddress: address.detail,
      deliveryNotes: addressRequest,
      entranceType: selectedValue.value,
      entranceDetail: selectedValue.text,
    };
    console.log('editaddress', editAddress);
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
              onPhoneChange={handlePhoneChange}
              renderSteps={[1, 2, 3, 4, 5, 6]}
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
