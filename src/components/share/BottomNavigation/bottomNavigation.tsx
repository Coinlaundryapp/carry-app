'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  BoxOffIcon,
  BoxOnIcon,
  ClothOffIcon,
  ClothOnIcon,
  HomeOffIcon,
  HomeOnIcon,
  MyOnIcon,
  MyOffIcon,
} from '@assets/icons';

const Icon = {
  Home: {
    active: <HomeOnIcon />,
    inactive: <HomeOffIcon />,
  },
  Cloth: {
    active: <ClothOnIcon />,
    inactive: <ClothOffIcon />,
  },
  Box: {
    active: <BoxOnIcon />,
    inactive: <BoxOffIcon />,
  },
  My: {
    active: <MyOnIcon />,
    inactive: <MyOffIcon />,
  },
};

type NavigationBarType = {
  title: string;
  path: string;
  icon: keyof typeof Icon;
};

export function BottomNavigation() {
  const pathname = usePathname();

  const navigationBarList: NavigationBarType[] = [
    { title: '홈', path: '/', icon: 'Home' },
    { title: '팀, 알뜰 세탁', path: '/team', icon: 'Cloth' },
    { title: '내 세탁 현황', path: '/status', icon: 'Box' },
    { title: '마이페이지', path: '/my', icon: 'My' },
  ];

  return (
    <nav
      style={{
        boxShadow: '0px -2px 6px 0px #878A931A',
      }}
      className="fixed bottom-0 w-full rounded-tl-xl rounded-tr-xl px-[24px] pb-[34px] pt-[10px]"
    >
      <ul className="flex justify-between gap-[14px]">
        {navigationBarList.map((item) => {
          const isCurrentPage = pathname === item.path;

          return (
            <li
              key={item.title}
              className={`${isCurrentPage ? 'text-primary-normal' : 'text-interaction-inactive'}`}
            >
              <Link href={item.path}>
                <figure className="flex w-[75px] flex-col items-center gap-[4px] font-semibold font-caption-1">
                  {isCurrentPage ? Icon[item.icon].active : Icon[item.icon].inactive}
                  <figcaption>{item.title}</figcaption>
                </figure>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
