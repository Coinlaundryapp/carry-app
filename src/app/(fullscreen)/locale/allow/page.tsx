'use client';

import Button from '@/components/share/Button/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SeoulMap from '@/components/ui/SeoulMap';
import { useModalStore } from '@/store/modal-store';
import IncheonMap from '@/components/ui/IncheonMap';

const AllowLocationPage = () => {
  const rotuer = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const district = searchParams.get('district');
  // const [activeLocale, setAcitveLocale] = useState('');

  // useEffect(() => {
  //   if (district === 'EUNPYEONG_GU') {
  //     setAcitveLocale('은평구');
  //   }
  //   if (district === 'KEYANG_GU') {
  //     setAcitveLocale('계양구');
  //   }
  // }, []);

  let activeLocale = '';

  if (district === 'EUNPYEONG_GU') {
    activeLocale = '은평구';
  }
  if (district === 'KEYANG_GU') {
    activeLocale = '계양구';
  }

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full px-[24px] py-[20px]">
        <p className="font-semibold font-heading-1">
          서비스를 이용하실 위치가 <br />
          <span className="text-primary-normal">{activeLocale}</span>가 맞나요?
        </p>
      </div>
      <div className="h-auto w-auto">
        {city === 'SEOUL_SI' && <SeoulMap activeLocale={activeLocale} canSelect={false} />}
        {city === 'INCHEON_SI' && <IncheonMap activeLocale={activeLocale} canSelect={false} />}
      </div>
      <div className="flex w-full flex-col gap-4 px-[24px]">
        <Button state="fillPrimary" size="full" onClick={() => {}}>
          맞아요
        </Button>
        <Button
          state="primary"
          size="full"
          onClick={() => {
            rotuer.push('/locale/select');
          }}
        >
          아니에요
        </Button>
      </div>
    </div>
  );
};

export default AllowLocationPage;
