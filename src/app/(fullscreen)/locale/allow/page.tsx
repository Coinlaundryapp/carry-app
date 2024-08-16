'use client';

import Button from '@/components/share/Button/Button';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import SeoulMap from '@/components/ui/SeoulMap';

const AllowLocationPage = () => {
  const rotuer = useRouter();

  const [activeLocale, setAcitveLocale] = useState('은평구');

  return (
    <div className="flex flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full px-[24px] py-[20px]">
        <p className="font-semibold font-heading-1">
          서비스를 이용하실 위치가 <br />
          <span className="text-primary-normal">{activeLocale}</span>가 맞나요?
        </p>
      </div>
      <div className="h-[280px] w-[340px]">
        <SeoulMap activeLocale={activeLocale} canSelect={false} />
      </div>
      <div className="flex flex-col gap-4">
        <Button
          text="맞아요"
          state="fillPrimary"
          size="large"
          onClick={() => rotuer.push('locale/select')}
        />
        <Button
          text="아니에요"
          state="primary"
          size="large"
          onClick={() => rotuer.push('/locale/select')}
        />
      </div>
    </div>
  );
};

export default AllowLocationPage;
