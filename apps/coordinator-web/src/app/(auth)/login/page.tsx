'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { devLogin, tokenStore, type CoordinatorRole } from '@features/auth';

/**
 * 로그인 — dev-login 전용(카카오 없음). 운영/내부 사용자라 소셜 로그인이 부적합하고,
 * 실 이메일 로그인 백엔드 표면이 아직 없어 dev-login(role)이 사실상 인증이다.
 *
 * coordinator-web은 운영(COORDINATOR)과 관리자(ADMIN) 두 역할을 한 앱에서 다룬다.
 * 별도 ADMIN 앱을 만들지 않고 role 가드로 통합한다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<CoordinatorRole>('COORDINATOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const tokens = await devLogin(role);
      tokenStore.set(tokens);
      router.replace('/');
    } catch {
      setError('로그인에 실패했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
  }

  const roles: { value: CoordinatorRole; label: string }[] = [
    { value: 'COORDINATOR', label: '코디네이터' },
    { value: 'ADMIN', label: '관리자' },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Carry 코디네이터</h1>
        <p className="mt-2 text-sm text-gray-500">배차를 조율하고 주문·환불을 운영하세요</p>
      </div>

      <div className="flex gap-2" role="radiogroup" aria-label="역할 선택">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={role === r.value}
            onClick={() => setRole(r.value)}
            className={
              'rounded-lg border px-4 py-2 text-sm font-medium ' +
              (role === r.value
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600')
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full max-w-xs rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? '로그인 중…' : '로그인'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
