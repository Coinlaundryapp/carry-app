'use client';
import React, { useState, useEffect } from 'react';
import RenderStepContent from '@/components/address/RenderStepContent';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';
import SearchForm from '@/components/address/SearchForm';
import { validateAllSteps, validateForm } from '@/validations/addressValidation';
import { REQUEST_OPTIONS } from '@/constants/request-options';
import { postAddress } from '@/api/addressApi';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/toast-store';
import { formatPhoneNumber } from '@/utils/formaPhoneNumber';

const AddressAddPage = () => {
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
  const addToast = useToastStore((state) => state.addToast);
  const triggerRefetch = useAddressStore((state) => state.triggerRefetch);
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;

  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: ({ accessToken, newAddress }: { accessToken: string; newAddress: any }) =>
      postAddress(accessToken, newAddress),
    onSuccess: () => {
      triggerRefetch();
      addToast({ message: '새 배송지가 추가되었습니다.', type: 'success' });
      router.replace('/address/list');
    },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);

    setFormData({ ...formData, phone: formattedPhone });
  };

  const handleChange = (value: string) => {
    setSelectedValue((pre) => ({ ...pre, value }));
  };

  const handleMainAddressChange = (value: string) => {
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

    const newAddress = {
      addressLabel: formData.addressLabel,
      recipientPhone: formData.phone,
      recipientName: formData.name,
      baseAddress: address.main,
      detailAddress: address.detail,
      deliveryNotes: addressRequest,
      entranceType: selectedValue.value,
      entranceDetail: selectedValue.text,
    };

    if (accessToken) {
      mutate({ accessToken, newAddress });
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
          <SearchForm onAddressChange={handleMainAddressChange} />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center p-6">
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
              setSelectedRequest={setSelectedRequest}
              handleChangeRequest={handleChangeRequest}
              onChangeRequestText={handleChangeRequestText}
              onPhoneChange={handlePhoneChange}
              renderSteps={[1, 2, 3, 4, 5, 6]}
              renderAllAtOnce={false}
            />
          </div>

          {step < 6 && (
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
          {step >= 6 ? (
            <div className="shadow-top absolute bottom-0 flex w-full justify-center bg-white p-4">
              <AddressButton
                onClick={handleConfirm}
                className={allStepsValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
                disabled={!allStepsValid}
              >
                추가하기
              </AddressButton>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default AddressAddPage;
