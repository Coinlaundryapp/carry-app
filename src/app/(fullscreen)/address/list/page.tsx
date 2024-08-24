'use client';

import DeliveryAddressList from '@/components/delivery/DeliveryAddressList';
import { TopNavigation } from '@/components/share/TopNavigation';
import { AddPlusIcon } from '@assets/icons';

export default function AddressSetting() {
  const goBack = () => {
    history.back();
  };
  return (
    <main>
      <TopNavigation type="back" title="배송지 설정" leftClick={goBack} />
      <section className="mb-4 flex flex-col px-5">
        <DeliveryAddressList />
        <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-primary-normal py-3.5 font-semibold text-primary-normal font-body-1-normal active:border-label-assistive active:text-label-assistive">
          <AddPlusIcon className="h-6 w-6 flex-shrink-0" />
          배송지 추가
        </button>
      </section>
    </main>
  );
}
