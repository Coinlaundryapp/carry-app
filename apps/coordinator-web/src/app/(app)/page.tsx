'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout, useRole } from '@features/auth';

/**
 * 코디네이터 홈 — 운영 메뉴 허브. ADMIN은 운영 대시보드 메뉴가 추가로 노출된다(role 가드).
 */
export default function HomePage() {
  const router = useRouter();
  const { isAdmin } = useRole();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const menus = [
    { href: '/orders', title: '주문 운영', desc: '주문 조회·취소·환불' },
    { href: '/dispatches', title: '배차 조율', desc: '미배정 배차 배정·취소' },
    ...(isAdmin
      ? [{ href: '/admin', title: '운영 대시보드', desc: 'ADMIN — 운영 요약·이벤트' }]
      : []),
  ];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">코디네이터 운영</h1>
        <button type="button" onClick={handleLogout} className="text-sm text-gray-500 underline">
          로그아웃
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {menus.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-gray-200 p-5 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <h2 className="font-semibold">{m.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{m.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
