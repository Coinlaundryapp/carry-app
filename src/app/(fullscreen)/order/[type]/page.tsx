import { notFound } from 'next/navigation';
import LaundryFunnel from '@/components/order/LaundryFunnel';
import { LaundryType } from '@/types/laundry-type';

const laundryTypes: Record<LaundryType, string> = {
  general: '일반 세탁',
  bedding: '이불 세탁',
  mixed: '일반 + 이불 세탁',
  shoes: '신발 세탁',
};

export function generateStaticParams() {
  return Object.keys(laundryTypes).map((type) => ({
    type,
  }));
}

export default function LaundryPage({ params }: Readonly<{ params: { type: string } }>) {
  const laundryType = params.type as LaundryType;
  if (!Object.keys(laundryTypes).includes(laundryType)) {
    notFound();
  }
  return <LaundryFunnel laundryType={laundryType} />;
}
