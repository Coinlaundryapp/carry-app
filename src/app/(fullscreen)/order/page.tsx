'use client';

import { useRouter } from 'next/navigation';
import { ParsedUrlQuery } from 'querystring';
import AddressField from '@/components/order/AddressField';
import CostField from '@/components/order/CostField';
import LaundryField from '@/components/order/LaundryField';
import PrivacyField from '@/components/order/PrivacyField';
import RequestField from '@/components/order/RequestFiled';
import TimeField from '@/components/order/TimeField';
import Button from '@/components/share/Button';
import Separator from '@/components/share/Separator/Separator';
import { TopNavigation } from '@/components/share/TopNavigation';
import { SelectedOptions } from '@/types/laundry-type';

function parseParams(query: ParsedUrlQuery): SelectedOptions {
  return {
    laundryType: query.laundryType as SelectedOptions['laundryType'],
    service: query.service as SelectedOptions['service'],
    wash: query.wash as SelectedOptions['wash'],
    dry: query.dry as SelectedOptions['dry'],
    shoePairs: query.shoePairs ? parseInt(query.shoePairs as string, 10) : undefined,
    folding: query.folding === 'true',
    softener: query.softener === 'true',
  };
}

export default function OrderPage({ searchParams }: Readonly<{ searchParams: ParsedUrlQuery }>) {
  const router = useRouter();
  const options = parseParams(searchParams);
  const handleBackClick = () => {
    router.replace(`/order/${options.laundryType}`);
  };
  return (
    <main>
      <TopNavigation type="back" leftClick={handleBackClick} title="수거 신청" />
      <AddressField key={'123'} addressId={'123'} />
      <Separator variant="horizontal8" />
      <RequestField />
      <Separator variant="horizontal8" />
      <LaundryField />
      <Separator variant="horizontal8" />
      <TimeField />
      <Separator variant="horizontal8" />
      <CostField />
      <Separator variant="horizontal8" />
      <PrivacyField />
      <div className="bg-white p-6 shadow-emphasize">
        <Button state="fillPrimary" size="full">
          수거 신청하기
        </Button>
      </div>
    </main>
  );
}
