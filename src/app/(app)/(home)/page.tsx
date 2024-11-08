import Link from 'next/link';
import HomeCard from '@/components/ui/HomeCard';

import {
  ArrowRightIcon,
  BellBadgeIcon,
  InformationCircle,
  LocationIcon,
  LogoIcon,
  ShirtBeddingIcon,
  ShirtIcon,
  SneakersIcon,
  VolumeIcon,
} from '@assets/icons';
import Tooltip from '@/components/share/Tooltip';
import Footer from '@/components/share/Footer/Footer';

const CARD_DATA = [
  {
    title: '일반 세탁',
    description: '의류, 속옷, 양말 등',
    href: '/order/SOLO/NEW/REGULAR',
    icon: <ShirtIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '이불 세탁',
    description: '극세사 겨울 이불 까지!',
    href: '/order/SOLO/NEW/BLANKET',
    icon: <ShirtBeddingIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '일반 + 이불 세탁',
    description: '의류, 속옷, 양말, 이불 구분없이 한 번에',
    href: '/order/SOLO/NEW/REGULAR_AND_BLANKET',
    icon: <ShirtBeddingIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '신발 세탁',
    description: '운동화 6켤레까지!',
    href: '/order/SOLO/NEW/SHOES',
    icon: <SneakersIcon className="h-[52px] w-[52px]" />,
  },
];
export default function HomePage() {
  return (
    <main>
      <section className="bg-background-normal-alternative px-5 pb-[25px]">
        <header className="flex w-full justify-between py-4" id="top">
          <LogoIcon />
          <div className="flex items-center gap-5">
            <Link href="#" className="font-normal text-label-neutral font-label-1-normal">
              가격표
            </Link>
            <button>
              <BellBadgeIcon />
            </button>
          </div>
        </header>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-label-normal font-heading-2">세탁 신청</h2>
            <button className="flex items-center gap-1">
              <InformationCircle />
              <p className="font-semibold text-base-blue-6 font-label-1-reading">
                이용 가이드 보기
              </p>
              <Tooltip message="처음 오셨나요?">
                <ArrowRightIcon />
              </Tooltip>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-sm bg-base-gold-1 px-2 py-2">
            <VolumeIcon />
            <p className="font-medium text-cool-neutral-40 font-label-2">
              색이 섞일까 걱정이시죠? 저희는{' '}
              <b className="font-semibold text-primary-normal">이염 방지 시트</b>로 세탁하니
              걱정마세요!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {CARD_DATA.map((data) => (
              <HomeCard
                key={data.href}
                title={data.title}
                description={data.description}
                href={data.href}
                icon={data.icon}
              />
            ))}
          </div>
          <Link
            href="/map/coin"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-[18px]"
          >
            <LocationIcon />
            <p className="font-semibold text-label-normal font-label-1-normal">
              내 주위 이용 가능한 코인 세탁소 보기
            </p>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
