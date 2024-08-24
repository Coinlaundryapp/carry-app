'use client';
import React, { useState, useEffect } from 'react';
import RenderStepContent from '@/components/address/RenderStepContent';
import { useAddressStore } from '@/store/address-store';
import AddressButton from '@/components/address/AddressButton';
import SearchForm from '@/components/address/SearchForm';
import { validateAllSteps, validateForm } from '@/validations/addressValidation';
import { REQUEST_OPTIONS } from '@/constants/request-options';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAddress, putAddress } from '@/api/addressApi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/toast-store';
import Loading from '@/components/share/Loading';

const EditFormPage = () => {
  const { addressModalOpen } = useAddressStore();
  const triggerRefetch = useAddressStore((state) => state.triggerRefetch);
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

  const { addressId } = useParams();

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => getAddress(accessToken, addressId),
    enabled: !!accessToken && !!addressId,
    staleTime: 0,
  });

  const { mutate } = useMutation({
    mutationFn: ({
      accessToken,
      editAddress,
      addressId,
    }: {
      accessToken: string;
      editAddress: any;
      addressId: string | string[];
    }) => putAddress(accessToken, addressId, editAddress),
    onSuccess: () => {
      addToast({ message: '배송지가 수정되었습니다.', type: 'success', duration: 2000 });
      triggerRefetch();
      router.push('/address/list');
    },
  });

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

  const handleChangeRequest = (value: string) => {
    setSelectedRequest((pre) => ({ ...pre, value }));
  };

  const handleChangeRequestText = (requestText: string) => {
    setSelectedRequest((pre) => ({ ...pre, requestText }));
  };

  useEffect(() => {
    if (data) {
      setFormData({
        addressLabel: data.addressLabel || '',
        name: data.recipientName || '',
        phone: data.recipientPhone || '',
      });
      setAddress({
        main: data.baseAddress || '',
        detail: data.detailAddress || '',
      });
      setSelectedValue({
        value: data.entranceType || '1',
        text: data.entranceDetail || '',
      });
      setSelectedRequest({
        value: data.deliveryNotes
          ? REQUEST_OPTIONS.find((option) => option.label === data.deliveryNotes)?.value || '4'
          : '1',
        requestText: data.deliveryNotes || '',
      });
    }
  }, [data]);

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
      mutate({ accessToken, addressId, editAddress });
    }
  };

  useEffect(() => {
    const validationInput = { step, formData, address, selectedValue, selectedRequest };
    setIsValid(validateForm(validationInput));
    setAllStepsValid(validateAllSteps(validationInput));
  }, [step, formData, address, selectedValue, selectedRequest]);

  if (isLoading) {
    return <Loading text="데이터를 불러오고 있는 중입니다." />;
  }

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
