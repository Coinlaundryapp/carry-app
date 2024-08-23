'use client';

import Button from '@/components/share/Button/Button';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import SeoulMap from '@/components/ui/SeoulMap';
import { useModalStore } from '@/store/modal-store';

const AllowLocationPage = () => {
  const rotuer = useRouter();

  const [activeLocale, setAcitveLocale] = useState('은평구');

  const openModal = useModalStore((state) => state.openModal);

  const cannotUseService = () => {
    openModal({
      type: 'confirm',
      image: 'sad',
      title: '서비스 불가 지역이에요!',
      description: '서비스 지역에서 이용해주세요',
      confirmText: '확인',
      closeText: '나가기',
    });
  };

  //TODO: 서비스 불가 지역일때 모달 오픈 되도록 추가

  return (
    <div className="flex flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full px-[24px] py-[20px]">
        <p className="font-semibold font-heading-1">
          서비스를 이용하실 위치가 <br />
          <span className="text-primary-normal">{activeLocale}</span>가 맞나요?
        </p>
      </div>
      <div className="h-[280px] w-[340px]">
        <SeoulMap activeLocale={activeLocale} canSelect={false} activatedArea={['은평구']} />
      </div>
      <div className="flex flex-col gap-4">
        <Button state="fillPrimary" size="large" onClick={() => {}}>
          맞아요
        </Button>
        <Button
          state="primary"
          size="large"
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
