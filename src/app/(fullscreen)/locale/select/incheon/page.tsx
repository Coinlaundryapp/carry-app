'use client';

import Button from '@/components/share/Button/Button';
import { TopNavigation } from '@/components/share/TopNavigation';
import IncheonMap from '@/components/ui/IncheonMap';
import { ACTIVATED_INCHEON } from '@/constants/activate-region';
import { useToastStore } from '@/store/toast-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EllipseIcon from '@assets/icons/ellipse.svg';
import { useModalStore } from '@/store/modal-store';

const SelectIncheonPage = () => {
  const router = useRouter();
  const [isActiveArea, setIsActiveArea] = useState<boolean | null>(null);
  const [selectArea, setSelectArea] = useState<string | null>(null);

  const openToast = useToastStore((state) => state.addToast);

  const cannotSelect = () => {
    openToast({
      message: '해당 지역은 서비스 불가 지역입니다.',
      type: 'error',
    });
  };

  const openModal = useModalStore((state) => state.openModal);

  const cannotUseHandler = () => {
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
    <div className="flex w-full flex-col items-center justify-between pb-[30px]">
      <div className="flex w-full flex-col gap-[20px]">
        <TopNavigation
          type="back"
          leftClick={() => {
            router.back();
          }}
        />
        <div className="flex min-h-[136px] w-full flex-col gap-[12px] px-[24px] py-[20px]">
          {/* 기본값 */}
          {isActiveArea === null && (
            <>
              <p className="font-semibold font-heading-1">
                서비스를 이용하실 지역을 <br />
                선택해주세요.
              </p>
              <p className="font-noraml-medium text-label-alternative">
                이 외의 지역은 오픈 신청을 도와드릴게요.
              </p>
            </>
          )}
          {/* 서비스 불가능 지역 */}
          {isActiveArea === false && (
            <>
              <p className="font-semibold font-heading-1">서비스 가능 지역을 선택해주세요.</p>
              <p className="font-noraml-medium text-label-alternative">
                이 외의 지역은 오픈 신청을 도와드릴게요.
              </p>
            </>
          )}
          {/* 서비스 가능 지역 */}
          {isActiveArea === true && (
            <p className="font-semibold font-heading-1">
              서비스를 이용하실 위치가 <br />
              <span className="text-primary-normal">{selectArea}</span>가 맞나요?
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-[30px]">
        <IncheonMap
          canSelect={true}
          getValue={(v) => {
            if (ACTIVATED_INCHEON.includes(v)) {
              setSelectArea(v);
              setIsActiveArea(true);
            } else {
              cannotSelect();
              setSelectArea(v);
              setIsActiveArea(false);
            }
          }}
        />
        <div className="flex w-fit gap-[30px] rounded-[10px] border border-line-neutral px-[20px] py-[10px]">
          <div className="flex items-center gap-[5px]">
            <EllipseIcon fill="#72D4D5" />
            <span className="text-cyan-200 font-label-1-normal">서비스 가능 지역</span>
          </div>
          <div className="flex items-center gap-[5px]">
            <EllipseIcon fill="#E1E2E4" />
            <span className="text-label-alternative font-label-1-normal">서비스 불가 지역</span>
          </div>
        </div>
      </div>

      <div className="flex-end flex min-h-[120px] w-full flex-col justify-end gap-4 px-[25px]">
        {/* 서비스 불가능 지역 */}
        {isActiveArea === false && (
          <div className="flex gap-[20px]">
            <Button state="primary" size="full" onClick={cannotUseHandler}>
              나가기
            </Button>
            <Button
              state="fillPrimary"
              size="full"
              onClick={() => {
                router.push(`/locale/notification?city=INCHEON_SI&district=${selectArea}`);
              }}
            >
              오픈 알림신청
            </Button>
          </div>
        )}
        {/* 서비스 가능 지역 */}
        {isActiveArea === true && (
          <>
            {selectArea && (
              <Button state="fillPrimary" size="full" onClick={() => router.push('/')}>
                맞아요
              </Button>
            )}
            <Button state="primary" size="full" onClick={cannotUseHandler}>
              나가기
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectIncheonPage;
