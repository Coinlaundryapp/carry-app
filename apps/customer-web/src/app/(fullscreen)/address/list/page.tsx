'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAddresses } from '@features/address/api/addressApi';
import { useAddressStore } from '@features/address/model/address-store';
import { useToastStore } from '@shared/model/toast-store';
import DeliveryAddressList from '@features/address/ui/DeliveryAddressList';
import { TopNavigation } from '@shared/ui/TopNavigation';
import { AddPlusIcon } from '@assets/icons';

export default function AddressSetting() {
  const router = useRouter();

  const { shouldRefetch, setShouldRefetch, setSelectedAddressId } = useAddressStore();
  const addToast = useToastStore((state) => state.addToast);
  const goBack = () => {
    history.back();
  };

  const goToAddAddress = () => {
    router.push('/address/form');
  };
  const session = useSession();
  const accessToken = session.data?.user?.accessToken;

  const { data, refetch, isSuccess } = useQuery({
    queryKey: ['addresses', accessToken],
    queryFn: () => getAddresses(accessToken),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch, setShouldRefetch]);

  useEffect(() => {
    if (isSuccess && data) {
      const defaultAddress = data.find((address) => address.isDefault === true);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.addressId);
      }
    }
  }, [isSuccess, data, setSelectedAddressId]);

  useEffect(() => {
    if (isSuccess && data && data.length === 0) {
      addToast({ message: '기본 배송지 하나 이상은 필요합니다.', type: 'error' });
    }
  }, [isSuccess, data, addToast]);

  const renderButton = () => (
    <button
      onClick={goToAddAddress}
      className="border-primary-normal text-primary-normal font-body-1-normal active:border-label-assistive active:text-label-assistive mt-4 flex w-full items-center justify-center gap-1 rounded-md border py-3.5 font-semibold"
    >
      <AddPlusIcon className="h-6 w-6 flex-shrink-0" />
      배송지 추가
    </button>
  );

  return (
    <main className="flex h-full flex-col">
      <TopNavigation type="back" title="배송지 설정" leftClick={goBack} />
      {data && data.length !== 0 ? (
        <section className="mb-4 flex flex-grow flex-col overflow-y-auto px-5">
          <DeliveryAddressList addressList={data} />
          {renderButton()}
        </section>
      ) : (
        <div className="mb-4 flex flex-grow flex-col overflow-y-auto px-6">{renderButton()}</div>
      )}
    </main>
  );
}
