'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@features/auth';

/**
 * 코디네이터 홈 — 운영 메뉴 허브. 세부 화면(주문·배차·환불)은 후속 단계에서 추가된다.
 */
export default function HomePage() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const menus = [
    { href: '/orders', title: '주문 운영', desc: '주문 조회·취소·환불' },
    { href: '/dispatches', title: '배차 조율', desc: '미배정 배차 배정·취소' },
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
