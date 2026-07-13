'use client';

import { useRouter } from 'next/navigation';
import TopNavigation from '@shared/ui/TopNavigation/TopNavigation';
import { MyCardSection } from '@features/billing';

export default function Page() {
  const router = useRouter();

  return (
    <>
      <TopNavigation type="back" title="결제수단" leftClick={() => router.back()} />
      <div className="mb-[87px] px-5 pt-6">
        <MyCardSection />
      </div>
    </>
  );
}
