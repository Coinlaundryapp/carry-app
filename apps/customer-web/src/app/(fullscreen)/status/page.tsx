'use client';

import { getOrderList } from '@features/status/api/getOrderList';
import Button from '@shared/ui/Button/Button';
import StatusCard from '@features/status/ui/StatusCard';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Seperate from '@assets/icons/separateWash.svg';

const Page = () => {
  const session = useSession();
  const accessToken = session.data?.user.accessToken as string;

  const { data: orderList } = useQuery({
    queryKey: ['getOrderList'],
    // 첫 페이지는 cursor 없이 조회한다. cursor=0을 넘기면 백엔드가 "id < 0"으로 해석해
    // 항상 빈 목록이 돌아온다(0은 유효 주문 id라 시작점이 아니다).
    queryFn: () => getOrderList(accessToken),
    enabled: !!accessToken,
  });

  return orderList?.length ? (
    <div className="flex h-full w-full flex-col gap-[12px]">
      <div className="flex px-[20px] py-[24px]">
        <span className="font_heading_1 font-semibold">내 세탁 현황</span>
      </div>
      <div className="flex flex-col gap-[20px]">
        {orderList?.map((order) => (
          <StatusCard
            key={order.id}
            variant="list"
            info={order}
            orderStatus={order.status}
            hasButton
          />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex h-full w-full flex-col">
      <div className="bg-background-normal-alternative flex h-[165px] items-center justify-between px-[24px]">
        <p className="font_headline_2 text-label-neutral">
          아직 <br /> 내 세탁 기록이 없어요!
        </p>
        <Seperate aria-label="분리세탁 아이콘" width={120} height={120} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-[32px]">
          <div className="flex flex-col gap-[20px]">
            <Image src={''} alt="..." width={148} height={148} />
            <div className="flex flex-col gap-[8px]">
              <p className="font_heading_2 text-label-alternative text-center font-semibold">
                앗! <br />
                아직 이용한 서비스가 없어요.
              </p>
              <p className="font_body_1_normal font-normal-semibold text-label-alternative text-center">
                편리한 세탁 서비스를 신청해 보세요.
              </p>
            </div>
          </div>
          <Button state="fillPrimary" size="small">
            세탁 신청하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
