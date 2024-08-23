'use client';

import { useRouter } from 'next/navigation';
import DeliveryAddressList from '@/components/delivery/DeliveryAddressList';
import { TopNavigation } from '@/components/share/TopNavigation';
import { AddPlusIcon } from '@assets/icons';
import { useQuery } from '@tanstack/react-query';
import { getAddresses } from '@/api/addressApi';
import { useSession } from 'next-auth/react';
import Toast from '@/components/share/Toast';
import { useEffect } from 'react';
import { useToastStore } from '@/store/toast-store';
import { useAddressStore } from '@/store/address-store';
import Loading from '@/components/share/Loading';

export default function AddressSetting() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const { shouldRefetch, setShouldRefetch } = useAddressStore();

  const goBack = () => {
    history.back();
  };

  const goToAddAddress = () => {
    router.push('/address/form');
  };

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;

  const { data, isLoading, refetch } = useQuery({
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

  if (isLoading) {
    return <Loading text="데이터를 불러오고 있는 중입니다." />;
  }

  return (
    <main className="flex h-full flex-col">
      <TopNavigation type="back" title="배송지 설정" leftClick={goBack} />
      <div className="pl-2 pr-2">
        <Toast />
      </div>
      <section className="mb-4 flex flex-grow flex-col overflow-y-auto px-5">
        {data && data.length !== 0 && <DeliveryAddressList addressList={data} />}
        <button
          onClick={goToAddAddress}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-primary-normal py-3.5 font-semibold text-primary-normal font-body-1-normal active:border-label-assistive active:text-label-assistive"
        >
          <AddPlusIcon className="h-6 w-6 flex-shrink-0" />
          배송지 추가
        </button>
      </section>
    </main>
  );
}
