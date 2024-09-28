'use client';
import { RateStaIcon, RightIcon } from '@assets/icons';
import Image from 'next/image';
import { KINDS_STATUS } from '@/constants/map';

import { useParams, useRouter } from 'next/navigation';
import { useRef } from 'react';
import useOrderStore from '@/store/order-store';
import Review from './Review';

type Props = {
  data: any;
  expanded: boolean;
  onClickExpended: () => void;
};

const dummydata = [
  {
    id: '1',
    userId: '023451',
    content: '마포구 세탁소123 팀 세탁',
    start: 3,
    day: '2024.05.01',
    text: '이 어플을 알게 된 후 삶의 질이 올라갔어요! 주변에 세탁소가 없어서 드라이도 못했는데 이 어플 덕분에 문앞에서 바로 빨래를 받을 수 있어서 너무 좋았어요. 때에 찌든 옷을 맡겼는데 때가 싹 빠져서 너무 흐뭇했어요! 옷도 하나 서비스로 해주셨는데 감동이었습니다.',
  },
  {
    id: '2',
    userId: 'skdet',
    content: '마포구 세탁소123 팀 세탁',
    start: 5,
    day: '2024.05.01',
    text: '이 어플을 알게 된 후 삶의 질이 올라갔어요! 주변에 세탁소가 없어서 드라이도 못했는데 이 어플 덕분에 문앞에서 바로 빨래를 받을 수 있어서 너무 좋았어요. 때에 찌든 옷을 맡겼는데 때가 싹 빠져서 너무 흐뭇했어요! 옷도 하나 서비스로 해주셨는데 감동이었습니다.',
  },
];

function CoinlaundrySelectedItem({ data, expanded, onClickExpended }: Props) {

  const router = useRouter();
  const { type } = useParams();

  const { setLaundryromat } = useOrderStore();

  const handleSelectClick = () => {
    setLaundryromat(data);
    router.back();
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const dynamicHeight = expanded ? (data.reviewCount < 1 ? 'h-[60vh]' : 'h-[78vh]') : 'h-[40vh]';

  return (
    <div
      ref={contentRef}
      className={`transition-max-height overflow-y-auto duration-500 ease-in-out ${dynamicHeight}`}
    >
      <div key={data.id} className="mx-5 mt-2">
        <div className="flex justify-between">
          <div className="mb-2 flex items-center justify-start gap-2">
            <h3 className="font_headline_2 text-start">{data.name}</h3>
            <div className="font_caption_1 text-label-alternative">
              {Math.round(data.distance)}km
            </div>
          </div>
        </div>
        <div className="mb-1 flex items-center justify-between">
          <div className="font_label_1_reading text-label-alternative">{data.address}</div>
          <div className="flex gap-1">
            {data.options.map((option: string) => {
              const optionstatus = KINDS_STATUS.find((status) => status.id === option);
              //
              if (!optionstatus) return null;

              return (
                <div key={option}>
                  <optionstatus.component />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-1 flex items-center gap-1">
          <div className="flex items-center gap-1">
            <RateStaIcon />
            <span className="font_label_2 text-label-neutral">
              {data.reviewAverageRating.toFixed(1)}
            </span>
          </div>
          <span className="font_label_2 text-label-neutral"> • 리뷰{data.reviewCount}개</span>
          {data.reviewCount !== 0 && <RightIcon onClick={onClickExpended} />}
        </div>

        <div className="mb-4 flex flex-col items-start justify-between gap-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font_caption_1 text-primary-normal">
                {data.type === '0' ? '단독 세탁' : '세탁'}
              </span>
              <div className="font_label_1_normal">배송비 {data.individualDeliveryFee}원</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
              <div className="font_label_1_normal">배송비 {data.groupDeliveryFee}원</div>
            </div>
          </div>

          <div className="flex w-full justify-between">
            {data.mediaResources.length !== 0 &&
              data.mediaResources.map(({ mediaUrl }: { mediaUrl: string }) => (
                <div
                  key={mediaUrl}
                  className="flex-shrink-0 cursor-pointer"
                  style={{ width: 'calc(33.33% - 8px)' }}
                >
                  <Image
                    className="rounded-sm"
                    alt={'Image description'}
                    src={mediaUrl}
                    width={112}
                    height={96}
                  />
                </div>
              ))}
          </div>
          {expanded && (
            <div className="flex flex-col gap-2">
              {dummydata.map((review) => {
                return <Review key={review.id} data={review} />;
              })}
            </div>
          )}
          {type === 'order' && (
            <button
              onClick={handleSelectClick}
              className="font-font_body_1_normal mb-5 h-[52px] w-full rounded-md bg-primary-normal text-white"
            >
              선택
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoinlaundrySelectedItem;
