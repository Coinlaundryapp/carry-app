'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMe, logout, type UserProfile } from '@features/auth';
import { useV2Client } from '@shared/api/useV2Client';

/**
 * 배달원 홈 — 인증 확인용 프로필 표시 + 로그아웃. 배차/배달 진입은 후속(C2-1/C2-2)에서 추가.
 */
export default function HomePage() {
  const client = useV2Client();
  const router = useRouter();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe(client)
      .then(setMe)
      .catch(() => setError('프로필을 불러오지 못했습니다.'));
  }, [client]);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Carry 배달원</h1>
        <button type="button" onClick={handleLogout} className="text-sm text-gray-500 underline">
          로그아웃
        </button>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {me && (
        <section className="rounded-lg border border-gray-200 p-4">
          <p className="font-semibold">{me.name}님</p>
          <p className="mt-1 text-sm text-gray-500">
            {me.role} · {me.email}
          </p>
        </section>
      )}

      <nav className="flex flex-col gap-2">
        <Link
          href="/dispatches"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
        >
          배차 보기
        </Link>
        <Link
          href="/deliveries"
          className="rounded-lg border border-blue-600 px-4 py-3 text-center font-semibold text-blue-600"
        >
          내 배달
        </Link>
        <Link href="/areas" className="text-center text-sm text-gray-500 underline">
          활동 권역 관리
        </Link>
      </nav>
    </main>
  );
}
