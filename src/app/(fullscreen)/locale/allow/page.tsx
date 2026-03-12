'use client';

import Button from '@shared/ui/Button/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import SeoulMap from '@features/location/ui/SeoulMap';
import IncheonMap from '@features/location/ui/IncheonMap';

const AllowLocationPage = () => {
  const rotuer = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const district = searchParams.get('district');

  let selectedLocale = '';

  if (district === 'EUNPYEONG_GU_SEOUL') {
    selectedLocale = '은평구';
  }

  if (district === 'GYEYANG_GU_INCHEON') {
    selectedLocale = '계양구';
  }

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full px-[24px] py-[20px]">
        <p className="font-semibold font-heading-1">
          서비스를 이용하실 위치가 <br />
          <span className="text-primary-normal">{selectedLocale}</span>가 맞나요?
        </p>
      </div>
      <div className="h-auto w-auto">
        {city === 'SEOUL_SI' && (
          <SeoulMap selectedLocale={selectedLocale} canSelect={false} activatedArea={[]} />
        )}
        {city === 'INCHEON_SI' && (
          <IncheonMap selectedLocale={selectedLocale} canSelect={false} activatedArea={[]} />
        )}
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
