'use client';

import Button from '@shared/ui/Button/Button';
import { TopNavigation } from '@shared/ui/TopNavigation';
import { useRouter } from 'next/navigation';
import QuestionMark from '@assets/icons/question_mark.svg';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@features/status/api/getOrderDetail';

export default function OrederStatusDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const orderId = params.id;

  const session = useSession();
  const accessToken = session.data?.user.accessToken as string;

  const { data: orderDetail } = useQuery({
    queryKey: ['getOrderDetail', orderId],
    queryFn: () => getOrderDetail(accessToken, Number(orderId)),
    enabled: !!accessToken,
  });

  return (
    <>
      <TopNavigation
        type="back"
        leftClick={() => {
          router.back();
        }}
      />
      <div className="flex items-start py-[20px]">
        <div className="flex w-full flex-col gap-[16px] px-[20px]">
          <span className="font_headline_1 font-semibold text-primary-normal">신청 완료</span>
          <div className="flex items-center gap-[8px]">
            <span className="font_label_1_normal font-semibold">
              {/* {orderDetail?.orderShedule.desiredPickupDateTime} */}
            </span>
            <span className="font_label_1_normal text-label-alternative">
              주문번호 {orderDetail?.id}
            </span>
          </div>
        </div>
      </div>
      <div className="h-[8px] bg-background-elevated-alternative" />
      {/* 주문 상세 정보 */}
      <div className="flex flex-col gap-[20px] p-[20px]">
        <div className="flex flex-col">
          <div className="pb-[24px] pt-[20px]">
            <span className="font_headline_1 font-semibold">주문 상세 정보</span>
          </div>
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between">
              <span className="font_body_1_reading font-semibold">이용 세탁소</span>
              <span className="font_body_1_reading font-semibold">
                {orderDetail?.laundromatName}
              </span>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span className="font_body_1_reading font-semibold">세탁 서비스</span>
                <span className="font_body_1_reading font-semibold">
                  {orderDetail?.orderContent.orderUnitType === 'SOLO'}
                </span>
              </div>
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font_body_2_normal text-label-alternative">
                    ㄴ 표준 세탁 코스
                  </span>
                  <span className="font_body_2_normal text-label-alternative">4,500원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font_body_2_normal text-label-alternative">ㄴ 고온 건조</span>
                  <span className="font_body_2_normal text-label-alternative">5,000원</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-line-normal" />
        <div className="flex flex-col gap-[8px]">
          <span className="font_body_1_reading font-semibold">수거 세탁물 정보</span>
          <div className="flex items-center justify-between">
            <span className="font_body_2_normal text-label-alternative">세탁물 무게</span>
            <span className="font_body_2_normal font-semibold text-label-normal">4kg</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font_body_2_normal text-label-alternative">사용 세탁기</span>
            <span className="font_body_2_normal font-semibold text-label-normal">18kg</span>
          </div>
        </div>
      </div>
      <div className="h-[8px] bg-background-elevated-alternative" />
      {/* 수거/배송 정보 */}
      <div className="flex flex-col gap-[16px] p-[20px]">
        <span className="font_headline_1 font-semibold">수거/배송 정보</span>
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between">
            <span className="font_body_2_normal text-label-alternative">수거 시각</span>
            <span className="font_body_2_normal font-semibold text-label-normal">
              12월30일 (토) 낮 12시
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font_body_2_normal text-label-alternative">예정된 배송 완료 시각</span>
            <span className="font_body_2_normal font-semibold text-label-normal">
              12월31일 (일) 낮 12시까지
            </span>
          </div>
        </div>
      </div>
      <div className="h-[8px] bg-background-elevated-alternative" />
      {/* 배송지 정보 */}
      <div className="flex flex-col gap-[16px] p-[20px]">
        <span className="font_headline_1 font-semibold">배송지 정보</span>
        <div className="flex flex-col gap-[8px]">
          <span className="font_body_1_reading font-semibold text-label-strong">배송지 주소</span>
          <div className="flex flex-col gap-[8px]">
            <div className="flex gap-[8px]">
              <span className="font_body_1_normal font-semibold text-label-neutral">홍길동</span>
              <span></span>
              <span className="font_label_1_normal text-label-neutral">010-1234-5678</span>
            </div>
            <p className="font_label_1_normal text-label-neutral">
              서울 강서구 공항대로 583 104동 1601호 (염창동, e편한세상)
            </p>
          </div>
        </div>
        <div className="h-[1px] w-full bg-line-neutral" />
        <div className="flex flex-col gap-[12px]">
          <span className="font_body_1_reading font-semibold text-label-strong">배송 요청사항</span>
          <div className="flex flex-col gap-[8px]">
            <div className="flex gap-[12px]">
              <span className="font_label_1_normal font-semibold text-primary-normal">
                공동현관 비밀번호
              </span>
              <span className="font_label_1_normal text-label-neutral">종 1234 열쇠</span>
            </div>
            <div className="flex gap-[12px]">
              <span className="font_label_1_normal font-semibold text-primary-normal">???님께</span>
              <span className="font_label_1_normal text-label-neutral">문 앞에 높아주세요</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[8px] bg-background-elevated-alternative" />
      {/* 결제 정보 */}
      <div className="flex flex-col gap-[24px] p-[20px]">
        <span className="font_headline_1 font-semibold">결제 정보</span>
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[8px]">
              <div className="font_body_1_reading flex justify-between self-stretch font-semibold text-label-normal">
                <span>세탁 금액</span>
                <span>10,500원</span>
              </div>
              <div className="font_label_1_normal flex justify-between self-stretch text-label-alternative">
                <span>ㄴ 할인금액</span>
                <span>0원</span>
              </div>
              <div className="font_label_1_normal flex justify-between self-stretch text-label-alternative">
                <span>ㄴ 세탁 대행료 10%</span>
                <span>1,050원</span>
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="font_body_1_reading flex justify-between self-stretch font-semibold text-label-normal">
                <div className="flex items-center gap-[4px]">
                  <span>배송비</span>
                  <QuestionMark />
                </div>
                <span>4,000원</span>
              </div>
              <div className="font_label_1_normal flex justify-between self-stretch text-label-alternative">
                <span>ㄴ 할인금액</span>
                <span>0원</span>
              </div>
            </div>
          </div>
          <div className="h-[1px] w-full bg-line-neutral" />
          <div className="flex justify-between">
            <span className="font_headline_1 font-semibold text-label-strong">예상 결제 금액</span>
            <span className="font_heading_2 font-semibold text-primary-normal">14,550원~</span>
          </div>
        </div>
      </div>
      <div className="flex gap-[12px] px-[20px] pb-[23px] pt-[30px]">
        <Button state="primary" size="full" onClick={() => {}}>
          주문 취소
        </Button>
        <Button state="primary" size="full" onClick={() => {}}>
          1:1 문의하기
        </Button>
      </div>
    </>
  );
}
