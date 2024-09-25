import { RateStaIcon } from '@assets/icons';
import Image from 'next/image';
import { KINDS_STATUS } from '@/constants/map';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Test from './test.svg';
import { useLaundromatStore } from '@/store/order-store';

type Props = {
  data: any;

  type?: 'map' | 'order';
};

function CoinlaundrySelectedItem({ data }: Props) {
  const { type } = useParams();
  const [expanded, setExpanded] = useState(false);

  const { setSelectedLaundromat } = useLaundromatStore();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleSelectClick = () => {
    setSelectedLaundromat(data); // 선택된 데이터를 zustand에 저장
  };

  return (
    <div
      className={`transition-all duration-300 ${expanded ? 'h-[50vh] overflow-y-auto' : 'h-auto'}`}
      onClick={handleExpandClick}
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
            <span className="font_label_2 text-label-neutral">{data.reviewAverageRating}</span>
          </div>
          <span className="font_label_2 text-label-neutral"> • 리뷰{data.reviewCount}개</span>
        </div>

        <div className="mb-4 flex flex-col items-start justify-between gap-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font_caption_1 text-primary-normal">
                {data.type === '0' ? '단독 세탁' : '세탁'}
              </span>
              <div className="font_label_1_normal">배송비 6000원</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
              <div className="font_label_1_normal">배송비 6000원</div>
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
          {/* {expanded && <Test />} */}
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
