'use client';

import Button from '@/components/share/Button/Button';
import { TopNavigation } from '@/components/share/TopNavigation';
import SeoulMap from '@/components/ui/SeoulMap';
import { ACTIVATED_AREA } from '@/constants/activate-region';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SelectSeoulpage = () => {
  const router = useRouter();
  const [selectArea, setSelectArea] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col items-center justify-between pb-[30px]">
      <div className="flex w-full flex-col gap-[20px]">
        <TopNavigation
          type="back"
          leftClick={() => {
            router.back();
          }}
        />
        <div className="flex w-full flex-col gap-[12px] px-[24px] py-[20px]">
          <p className="font-semibold font-heading-1">
            현재 서비스 중인 지역은
            <br />
            <span className="text-primary-normal">
              {ACTIVATED_AREA.map((area) => area).join(', ')}
            </span>
            입니다.
          </p>
          <p>원하는 지역을 선택해주세요.</p>
        </div>
      </div>
      <SeoulMap
        canSelect={true}
        getValue={(v) => {
          setSelectArea(v);
        }}
      />
      <div className="flex-end flex h-[120px] flex-col justify-end gap-4">
        {selectArea && (
          <Button state="fillPrimary" size="large" onClick={() => {}}>
            확인
          </Button>
        )}
        <Button state="primary" size="large" onClick={() => {}}>
          다음에 이용하기
        </Button>
      </div>
    </div>
  );
};

export default SelectSeoulpage;
