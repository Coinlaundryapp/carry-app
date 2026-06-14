'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { devLogin, tokenStore } from '@features/auth';

/**
 * 로그인 — dev-login 전용(카카오 없음). 운영/내부 사용자라 소셜 로그인이 부적합하고,
 * 실 전화 로그인 백엔드 표면이 아직 없어 dev-login(role=CARRIER)이 사실상 인증이다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const tokens = await devLogin('CARRIER');
      tokenStore.set(tokens);
      router.replace('/');
    } catch {
      setError('로그인에 실패했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Carry 배달원</h1>
        <p className="mt-2 text-sm text-gray-500">배차를 수락하고 배달을 진행하세요</p>
      </div>
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full max-w-xs rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? '로그인 중…' : '배달원으로 로그인'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
