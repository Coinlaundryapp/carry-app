'use client';

import React, { useEffect } from 'react';
import { useAddressForm } from '@features/address/lib/useAddressForm';
import { useAddressStore } from '@features/address/model/address-store';
import RenderStepContent from '@features/address/ui/RenderStepContent';
import AddressButton from '@features/address/ui/AddressButton';
import SearchForm from '@features/address/ui/SearchForm';
import { getAddress, putAddress } from '@features/address/api/addressApi';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useToastStore } from '@shared/model/toast-store';
import Loading from '@shared/ui/Loading';

const EditFormPage = () => {
  const { addressModalOpen } = useAddressStore();
  const triggerRefetch = useAddressStore((state) => state.triggerRefetch);
  const addToast = useToastStore((state) => state.addToast);
  const { addressId } = useParams();
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const router = useRouter();

  const form = useAddressForm();

  const { data, isLoading } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => getAddress(accessToken, addressId),
    enabled: !!accessToken && !!addressId,
    staleTime: 0,
  });

  // 기존 데이터로 폼 채우기
  useEffect(() => {
    form.populateForm(data);
  }, [data, form.populateForm]);

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
      addToast({ message: '배송지가 수정되었습니다.', type: 'success' });
      triggerRefetch();
      router.push('/address/list');
    },
  });

  const handleConfirm = () => {
    if (accessToken) {
      mutate({ accessToken, addressId, editAddress: form.buildPayload() });
    }
  };

  if (isLoading) {
    return <Loading text="데이터를 불러오고 있는 중입니다." />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-scroll pb-16">
      {addressModalOpen ? (
        <div className="relative z-50 max-h-full w-full max-w-full overflow-hidden bg-white">
          <SearchForm onAddressChange={form.handleMainAddressChange} />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center p-6">
            <RenderStepContent
              step={form.step}
              formData={form.formData}
              setFormData={form.setFormData}
              address={form.address}
              setAddress={form.setAddress}
              selectedValue={form.selectedValue}
              handleChange={form.handleChange}
              handleExtraInfoChange={form.handleExtraInfoChange}
              selectedRequest={form.selectedRequest}
              handleChangeRequest={form.handleChangeRequest}
              onChangeRequestText={form.handleChangeRequestText}
              onPhoneChange={form.handlePhoneChange}
              renderSteps={[1, 2, 3, 4, 5, 6]}
              renderAllAtOnce={true}
            />
          </div>

          <div className="absolute bottom-0 flex w-full justify-center bg-white p-4">
            <AddressButton
              onClick={handleConfirm}
              className={form.allStepsValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
              disabled={!form.allStepsValid}
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
