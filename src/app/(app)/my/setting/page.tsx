'use client';

import React from 'react';
import TopNavigation from '@/components/share/TopNavigation/TopNavigation';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useModalStore } from '@/store/modal-store';
import { MenuChevronRightIcon } from '@assets/icons';

export default function Page() {
  const router = useRouter();
  const { status } = useSession();
  const { openModal } = useModalStore();

  const MY_SETTING_MENU = [
    {
      id: 'logOut-login',
      title: status === 'authenticated' ? '로그아웃' : '로그인',
      path: status === 'authenticated' ? '#' : '/login',
    },
  ];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    openModal({
      type: 'confirm',
      title: '로그아웃',
      description: ' 로그아웃 하시겠어요?',
      closeText: '취소',
      confirmText: '확인',
      onConfirm: async () => {
        await signOut({ redirect: false });
        router.push('/');
      },
    });
  };

  return (
    <>
      <TopNavigation type="back" title="계정 설정" leftClick={() => router.back()} />
      <div className="mb-[87px] px-5 pt-6">
        {MY_SETTING_MENU.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={handleClick}
            className="flex w-full items-center justify-between"
          >
            <span className="font-semibold text-label-neutral font-body-1-normal">
              {item.title}
            </span>
            <MenuChevronRightIcon />
          </a>
        ))}
      </div>
    </>
  );
}
