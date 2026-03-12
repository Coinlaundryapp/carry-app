'use client';

import Button from '@shared/ui/Button/Button';
import MessageCard from '@shared/ui/MessageCard';
import SelectCard from '@shared/ui/SelectCard';
import { ACTIVATED_CITY } from '@features/location/lib/activate-region';
import { useRouter } from 'next/navigation';
import SeoulImg from '@assets/images/seoul-image.svg';
import IncheonImg from '@assets/images/incheon-image.svg';
import { useModalStore } from '@shared/model/modal-store';
import { useQuery } from '@tanstack/react-query';
import { getServiceAvailabiltyRegion } from '@features/location/api/getServiceAvailabilityRegion';

const SelectLocalePage = () => {
  const router = useRouter();

  const openModal = useModalStore((state) => state.openModal);

  const cannotUseService = () => {
    openModal({
      type: 'confirm',
      image: 'sad',
      title: '서비스를 이용할 수 없어요!',
      description: '다시 선택해주세요.',
      confirmText: '다시 선택',
      closeText: '나가기',
      onClose: () => router.push('/'),
    });
  };

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="w-full gap-[12px] px-[24px] py-[20px]">
        <p className="font-heading-1 font-semibold">
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
              <span className="font-heading-2 font-semibold">인천시</span>
            </div>
          </SelectCard>
          <SelectCard
            clickHandler={() => {
              router.push('/locale/select/seoul');
            }}
          >
            <div className="flex flex-1 flex-col items-center justify-between">
              <SeoulImg />
              <span className="font-heading-2 font-semibold">서울시</span>
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
      <div className="w-full px-[24px]">
        <Button state="primary" size="full" onClick={cannotUseService}>
          다음에 이용하기
        </Button>
      </div>
    </div>
  );
};

export default SelectLocalePage;
