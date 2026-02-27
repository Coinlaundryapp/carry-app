'use client';

import React from 'react';
import { useAddressForm } from '@features/address/lib/useAddressForm';
import { useAddressStore } from '@features/address/model/address-store';
import RenderStepContent from '@features/address/ui/RenderStepContent';
import AddressButton from '@features/address/ui/AddressButton';
import SearchForm from '@features/address/ui/SearchForm';
import { postAddress } from '@features/address/api/addressApi';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@shared/model/toast-store';

const AddressAddPage = () => {
  const { addressModalOpen } = useAddressStore();
  const addToast = useToastStore((state) => state.addToast);
  const triggerRefetch = useAddressStore((state) => state.triggerRefetch);
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const router = useRouter();

  const form = useAddressForm();

  const { mutate } = useMutation({
    mutationFn: ({ accessToken, newAddress }: { accessToken: string; newAddress: any }) =>
      postAddress(accessToken, newAddress),
    onSuccess: () => {
      triggerRefetch();
      addToast({ message: '새 배송지가 추가되었습니다.', type: 'success' });
      router.replace('/address/list');
    },
  });

  const handleConfirm = () => {
    if (accessToken) {
      mutate({ accessToken, newAddress: form.buildPayload() });
    }
  };

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
              renderAllAtOnce={false}
            />
          </div>

          {form.step < 6 && (
            <div className="shadow-top absolute bottom-0 flex w-full justify-center bg-white p-6">
              <AddressButton
                className={form.isValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
                onClick={form.handleNext}
                disabled={!form.isValid}
              >
                다음
              </AddressButton>
            </div>
          )}
          {form.step >= 6 ? (
            <div className="shadow-top absolute bottom-0 flex w-full justify-center bg-white p-6">
              <AddressButton
                onClick={handleConfirm}
                className={form.allStepsValid ? 'bg-primary-normal' : 'bg-cool-neutral-80'}
                disabled={!form.allStepsValid}
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
