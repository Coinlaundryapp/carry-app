import Link from 'next/link';
import HomeCard from '@/components/ui/HomeCard';
import {
  ADDRESS,
  BUSINESS_NUMBER,
  BUSINESS_REGISTRATION,
  COPYRIGHT,
  CUSTOMER_SERVICE,
  EMAIL,
  REPRESENTATIVE,
} from '@/constants/business-info';
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

const CARD_DATA = [
  {
    title: '일반 세탁',
    description: '의류, 속옷, 양말 등',
    href: '/order/general',
    icon: <ShirtIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '이불 세탁',
    description: '극세사 겨울 이불 까지!',
    href: '/order/bedding',
    icon: <ShirtBeddingIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '일반 + 이불 세탁',
    description: '의류, 속옷, 양말, 이불 구분없이 한 번에',
    href: '/order/mixed',
    icon: <ShirtBeddingIcon className="h-[52px] w-[52px]" />,
  },
  {
    title: '신발 세탁',
    description: '운동화 6켤레까지!',
    href: '/order/shoes',
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
            {CARD_DATA.map((data, index) => (
              <HomeCard
                key={index}
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
      <footer className="flex flex-col gap-5 bg-white px-5 pt-10">
        <p className="font-bold font-label-1-reading">세탁의 민족</p>
        <div className="flex flex-col gap-2 font-medium text-label-assistive font-caption-1">
          <p>사업자 등록번호 : {BUSINESS_NUMBER}</p>
          <p>대표 : {REPRESENTATIVE}</p>
          <p>주소 : {ADDRESS}</p>
          <p>이메일 : {EMAIL}</p>
          <p>통신판매업신고 : {BUSINESS_REGISTRATION}</p>
          <p>고객센터 : {CUSTOMER_SERVICE}</p>
          <p>{COPYRIGHT}</p>
        </div>
        <div className="flex items-center gap-2 font-medium text-label-assistive font-caption-1">
          <Link href="#">이용약관</Link>
          <div className="h-3 w-[1px] bg-label-assistive" />
          <Link href="#">개인정보 처리방침</Link>
        </div>
      </footer>
    </main>
  );
}
