import { RateStaIcon } from '@assets/icons';
import DummyImage from './Rectangle 1946.svg';
import DummysmallImage from './rectanglesmall.svg';

import Tag from '../share/Tag/Tag';
import clax from 'clsx';
import { KINDS_STATUS } from '@/constants/map';
type Props = {
  open: boolean;
  type: 'all' | 'one';
};

const DUMMY_DATA = [
  {
    id: '1',
    kind: ['0', '1', '2'],
    title: '소금이 세탁소',
    len: '1.1',
    address: '서울시 동작구 잠실동',
    star: 4.7,
    review: 24,
    delivery: 6000,
    type: '0',
  },
  {
    id: '2',
    title: '가나다라 세탁소',
    kind: ['0', '1', '2'],
    len: '1.1',
    address: '서울시 동작구 잠실동',
    star: 4.7,
    review: 24,
    delivery: 6000,
    type: '0',
  },
  {
    id: '3',
    title: '소금이 세탁소',
    kind: ['0'],
    len: '1.1',
    address: '서울시 동작구 잠실동',
    star: 4.7,
    review: 24,
    delivery: 6000,
    type: '0',
  },
  {
    id: '4',
    title: '소금이 세탁소',
    len: '1.1',
    kind: ['1', '2'],
    address: '서울시 동작구 잠실동',
    star: 4.7,
    review: 24,
    delivery: 6000,
    type: '0',
  },
];
const dummyImages = new Array(3).fill('./Rectangle 1946.svg');

function CoinlaundryDefault({ open, type = 'all' }: Props) {
  return (
    <div className="overflow-y-auto">
      {DUMMY_DATA.map((item) => {
        return (
          <div key={item.id} className="mb-4.5 mx-6 mt-5 border-b border-line-normal">
            <div className="flex justify-between">
              <div className="mb-2 flex items-center justify-start gap-2">
                <h3 className="font_headline_2">{item.title}</h3>
                <div className="font_caption_1 text-label-alternative">{item.len}km</div>
              </div>
              <div className="flex gap-1">
                {item.kind.map((kindId) => {
                  const kindStatus = KINDS_STATUS.find((status) => status.id === kindId);

                  if (!kindStatus) return null;

                  return (
                    <div key={kindId}>
                      <Tag
                        className="font_caption_1"
                        label={kindStatus.text}
                        color={kindStatus.color}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* <div className="font_label_1_normal mb-1 text-label-alternative">{item.address}</div> */}
            <div className="mb-1 flex items-center gap-1">
              <div className="flex items-center gap-1">
                <RateStaIcon />
                <span className="font_label_2 text-label-neutral">{item.star}</span>
              </div>
              <span className="font_label_2 text-label-neutral"> • 리뷰{item.review}개</span>
            </div>

            <div
              className={clax(
                'mb-4 flex justify-between',
                type === 'all' ? 'items-center' : 'flex-col items-start gap-5',
              )}
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font_caption_1 text-primary-normal">
                    {item.type === '0' ? '단독 세탁' : '세탁'}
                  </span>
                  <div className="font_label_1_normal">배송비 {item.delivery}원</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
                  <div className="font_label_1_normal">배송비 {item.delivery}원</div>
                </div>
              </div>

              {type == 'all' ? (
                <DummysmallImage />
              ) : (
                <div className="flex w-full justify-between">
                  {dummyImages.map((src, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 cursor-pointer"
                      style={{ width: 'calc(33.33% - 8px)' }}
                    >
                      {/* <img src={DummyImage} alt="Dummy" className="object-cover w-full h-full" /> */}
                      <DummyImage className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CoinlaundryDefault;
