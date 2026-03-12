'use client';

import Button from '@shared/ui/Button/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LocaleImg from '@assets/images/locale-image.png';
import { ACTIVATED_CITY } from '@features/location/lib/activate-region';
import { useModalStore } from '@shared/model/modal-store';
import { useGeoLocation } from '@features/location/lib/useGeoLocation';
import { fetchExtended } from '@shared/api/api-client';
import { ApiResponse, ServiceAvailabilityResponse } from '@shared/types/api-types';

const LocalePage = () => {
  const router = useRouter();

  const openModal = useModalStore((state) => state.openModal);

  const cannotUseHandler = () => {
    openModal({
      type: 'basic',
      image: 'sad',
      title: '서비스 불가 지역이에요!',
      description: '서비스 지역에서 이용해주세요.',
      closeText: '나가기',
      onClose: () => {
        window.close();
      },
    });
  };

  const { getLocation } = useGeoLocation();

  const allowHandler = async () => {
    const location = await getLocation();

    const res = await fetchExtended<ApiResponse<ServiceAvailabilityResponse>>(
      `/api/v1/service-availability?latitude=${location?.latitude}&longitude=${location?.longitude}`,
      {
        method: 'get',
      },
    );
    const locale = res.body.data;
    // 서비스 가능지역
    if (locale.serviceAvailabilityLevel === 'AVAILABLE') {
      router.push(`/locale/allow?city=${locale.region.city}&district=${locale.region.district}`);
    }
    // 서비스 가능지역 근처
    if (locale.serviceAvailabilityLevel === 'POTENTIALLY_AVAILABLE') {
      router.push('/locale/select');
    }
    // 서비스 가능지역 X
    if (locale.serviceAvailabilityLevel === 'UNAVAILABLE') {
      cannotUseHandler();
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[32px]">
      <div className="flex w-[350px] flex-col gap-[46px]">
        <div className="flex flex-col items-center gap-[20px]">
          <div className="flex items-center justify-center">
            <Image src={LocaleImg} alt="..." width={115} height={undefined} />
          </div>
          <div className="flex flex-col gap-[12px]">
            <p className="whitespace-pre text-center font-bold font-title-1">
              서비스 가능지역인지 <br /> 확인해드릴게요!
            </p>
            <p className="text-label-neutral font-body-2-normal">
              현재&nbsp;
              <span className="text-primary-normal">
                {ACTIVATED_CITY.map((city) => city).join(', ')}
              </span>
              에서만 서비스가 가능해요.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <Button state="fillPrimary" size="full" onClick={allowHandler}>
            위치 허용하기
          </Button>
          <Button
            state="primary"
            size="full"
            onClick={() => {
              window.close();
            }}
          >
            다음에 이용하기
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-[16px]">
        <div>이미 사용한 적 있으신가요?</div>
        <>카카오로 로그인</>
      </div>
    </div>
  );
};

export default LocalePage;
