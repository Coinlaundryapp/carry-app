'use client';
import React from 'react';
import { MenuListItem } from '@/components/share/Menu/Menu';
import TopNavigation from '@/components/share/TopNavigation/TopNavigation';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function page() {
  const router = useRouter();
  const { status } = useSession();

  const MY_SETTING_MENU = [
    {
      id: 'logOut-login',
      title: status === 'authenticated' ? '로그아웃' : '로그인',
      path: status === 'authenticated' ? '#' : '/login',
    },
  ];

  return (
    <>
      <TopNavigation type="back" title="계정 설정" leftClick={() => router.back()} />
      <div className="mb-[87px] px-5 pt-6">
        {MY_SETTING_MENU.map((item) => (
          <MenuListItem key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}

export default page;
