'use client';

import Button from '@/components/share/Button/Button';
import MessageCard from '@/components/ui/MessageCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LocaleImg from '@assets/images/locale-image.png';
import { ACTIVATED_CITY } from '@/constants/activate-region';
import { useModalStore } from '@/store/modal-store';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { fetchExtended } from '@/api/api-client';
import { ApiResponse, ServiceAvailabilityResponse } from '@/types/api-types';

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
      <div className="flex w-full flex-col gap-4 px-[24px] items-center ">
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
        <Button state="fillPrimary" size="full" onClick={allowHandler}>
          허용하기
        </Button>
        <Button
          state="primary"
          size="full"
          onClick={() => {
            window.close();
          }}
        >
          나중에 하기
        </Button>
      </div>
    </div>
  );
};

export default LocalePage;
