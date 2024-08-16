'use client';

import Button from '@/components/share/Button/Button';
import MessageCard from '@/components/ui/MessageCard';
import SelectCard from '@/components/ui/SelectCard';
import { ACTIVATED_CITY } from '@/constants/activate-region';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SeoulImg from '@assets/images/seoul-image.svg';
import IncheonImg from '@assets/images/incheon-image.svg';

const SelectLocalePage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full gap-[12px] px-[24px] py-[20px]">
        <p className="font-semibold font-heading-1">
          서비스를 이용하실 도시가 <br />
          어디인가요?
        </p>
      </div>
      <div className="flex flex-col gap-[36px]">
        <div className="flex gap-[22px]">
          <SelectCard
            clickHandler={() => {
              router.push('/locale/select/incheon');
            }}
          >
            <div className="flex flex-1 flex-col items-center justify-between">
              <IncheonImg />
              <span className="font-semibold font-heading-2">인천시</span>
            </div>
          </SelectCard>
          <SelectCard
            clickHandler={() => {
              router.push('/locale/select/seoul');
            }}
          >
            <div className="flex flex-1 flex-col items-center justify-between">
              <SeoulImg />
              <span className="font-semibold font-heading-2">서울시</span>
            </div>
          </SelectCard>
        </div>
        <MessageCard
          message={
            <p className="font-label-2">
              현재&nbsp;
              <span className="text-primary-normal">
                {ACTIVATED_CITY.map((city) => city).join(', ')}
              </span>
              에서만 서비스가 가능해요.
            </p>
          }
        />
      </div>
      <Button text="다음에 이용하기" state="primary" size="large" onClick={() => router.push('')} />
    </div>
  );
};

export default SelectLocalePage;
