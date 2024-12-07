import Menu from '@/components/share/Menu/Menu';
import Footer from '@/components/share/Footer/Footer';
import Separator from '@/components/share/Separator/Separator';
import {
  BasketWithMagnifierIcon,
  ChevronRightPrimaryIcon,
  HeadPhoneIcon,
  MenuLaundryIcon,
  MenuSettingIcon,
} from '@assets/icons';
import { Fragment } from 'react';
import UserInfo from '@/components/user/UserInfo';
import Link from 'next/link';

const SETTINGS_SECTIONS = [
  {
    id: 'laundry-info',
    title: '세탁 정보',
    icon: <MenuLaundryIcon />,
    items: [
      {
        id: 'order-history',
        title: '주문 내역',
        path: '#',
      },
    ],
  },
  {
    id: 'customer-service',
    title: '고객 센터',
    icon: <HeadPhoneIcon />,
    items: [
      {
        id: 'service-center',
        title: '고객 센터',
        path: 'sms:010-9432-0293',
        rightText: '매일 09:00~22:00',
      },
      {
        id: 'faq',
        title: '자주묻는 질문',
        path: '#',
      },
    ],
  },
  {
    id: 'member-info',
    title: '회원 정보',
    icon: <MenuSettingIcon />,
    items: [
      {
        id: 'delivery-management',
        title: '배송지 관리',
        path: '#',
      },
      {
        id: 'account-settings',
        title: '계정 설정',
        path: '#',
      },
    ],
  },
];

export default function MyPage() {
  return (
    <>
      <section className="flex flex-col gap-6 bg-background-normal-alternative px-5 py-6">
        <UserInfo />
        <div className="flex items-center justify-between rounded-md bg-static-white p-5 shadow-drop">
          <div className="flex flex-col">
            <h2 className="mb-1 font-semibold text-label-normal font-headline-2">
              캐리가 처음이신가요?
            </h2>
            <Link href="#" className="flex font-semibold text-primary-normal font-label-1-normal">
              이용 가이드 보러가기
              <ChevronRightPrimaryIcon />
            </Link>
          </div>
          <BasketWithMagnifierIcon />
        </div>
      </section>
      <div className="mb-[87px] px-5 pt-6">
        {SETTINGS_SECTIONS.map((menu) => (
          <Fragment key={menu.id}>
            <Menu menu={menu} />
            <Separator variant="horizontal" className="my-6 last:hidden" />
          </Fragment>
        ))}
      </div>
      {/* <Separator variant="horizontal8" /> */}
      {/* <Footer /> */}
    </>
  );
}
