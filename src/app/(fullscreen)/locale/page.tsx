'use client';

import Button from '@/components/share/Button/Button';
import MessageCard from '@/components/ui/MessageCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LocaleImg from '@assets/images/locale-image.png';
import { ACTIVATED_CITY } from '@/constants/activate-region';

const LocalePage = () => {
  const router = useRouter();
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-between pb-[30px] pt-[83px]">
      <div className="flex flex-col items-center gap-3">
        <p className="whitespace-pre text-center font-bold font-title-1">
          서비스 가능지역인지 <br /> 확인해드릴게요!
        </p>
        <p className="text-label-neutral font-body-2-normal">위치 정보만 허용해주세요</p>
      </div>
      <div className="flex h-[180px] w-[350px] items-center justify-center">
        <Image src={LocaleImg} alt="..." width={224} height={180} />
      </div>
      <div className="flex flex-col gap-4">
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
        <Button
          text="허용하기"
          state="fillPrimary"
          size="large"
          // 위치 허용 O
          onClick={() => {
            if (isServiceActive) {
              // 서비스 가능 지역
              router.push('locale/allow');
            } else {
              // 서비스 불가 지역
              // FIXME: 모달 변경
              alert('서비스 불가 지역이에요!');
            }
          }}
        />
        <Button
          text="나중에 하기"
          state="primary"
          size="large"
          // 위치 허용 X
          onClick={() => {
            // FIXME: 모달 변경
            alert('서비스를 이용 할 수 없어요');
          }}
        />
      </div>
    </div>
  );
};

export default LocalePage;
