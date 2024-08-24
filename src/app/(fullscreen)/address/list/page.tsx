'use client';

import { useRouter } from 'next/navigation';
import DeliveryAddressList from '@/components/address/DeliveryAddressList';
import { TopNavigation } from '@/components/share/TopNavigation';
import { AddPlusIcon } from '@assets/icons';
import { useQuery } from '@tanstack/react-query';
import { getAddresses } from '@/api/addressApi';
import { useSession } from 'next-auth/react';
import Toast from '@/components/share/Toast';
import { useEffect } from 'react';
import { useAddressStore } from '@/store/address-store';
import Loading from '@/components/share/Loading';
import { useToastStore } from '@/store/toast-store';

export default function AddressSetting() {
  const router = useRouter();

  const { shouldRefetch, setShouldRefetch } = useAddressStore();
  const addToast = useToastStore((state) => state.addToast);
  const goBack = () => {
    history.back();
  };

  const goToAddAddress = () => {
    router.push('/address/form');
  };

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;

  const { data, refetch } = useQuery({
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
    if (data && data.length === 0) {
      addToast({ message: '기본 배송지 하나 이상은 필요합니다.', type: 'error', duration: 2000 });
    }
  }, [data]);

  return (
    <main className="flex h-full flex-col">
      <TopNavigation type="back" title="배송지 설정" leftClick={goBack} />
      <div>
        <Toast />
      </div>
      {data && data.length !== 0 ? (
        <section className="mb-4 flex flex-grow flex-col overflow-y-auto px-5">
          <DeliveryAddressList addressList={data} />
          <button
            onClick={goToAddAddress}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-primary-normal py-3.5 font-semibold text-primary-normal font-body-1-normal active:border-label-assistive active:text-label-assistive"
          >
            <AddPlusIcon className="h-6 w-6 flex-shrink-0" />
            배송지 추가
          </button>
        </section>
      ) : (
        <div className="mb-4 flex flex-grow flex-col overflow-y-auto px-6">
          <button
            onClick={goToAddAddress}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-primary-normal py-3.5 font-semibold text-primary-normal font-body-1-normal active:border-label-assistive active:text-label-assistive"
          >
            <AddPlusIcon className="h-6 w-6 flex-shrink-0" />
            배송지 추가
          </button>
        </div>
      )}
    </main>
  );
}
