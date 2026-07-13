'use client';

import { useRouter } from 'next/navigation';
import TopNavigation from '@shared/ui/TopNavigation/TopNavigation';
import { OverdueResolution } from '@features/billing';

export default function Page() {
  const router = useRouter();

  return (
    <>
      <TopNavigation type="back" title="미납 결제 안내" leftClick={() => router.back()} />
      <div className="mb-[87px] px-5 pt-6">
        <OverdueResolution />
      </div>
    </>
  );
}
