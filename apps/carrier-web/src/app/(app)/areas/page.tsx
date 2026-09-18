'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_AREA_CODE,
  DEFAULT_AREA_NAME,
  getAreas,
  registerArea,
  removeArea,
  type CarrierArea,
} from '@features/area';

export default function AreasPage() {
  const [areas, setAreas] = useState<CarrierArea[]>([]);
  const [areaCode, setAreaCode] = useState(DEFAULT_AREA_CODE);
  const [areaName, setAreaName] = useState(DEFAULT_AREA_NAME);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setAreas(await getAreas());
    } catch {
      setNotice('권역 목록을 불러오지 못했습니다.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleRegister() {
    if (!areaCode.trim() || !areaName.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      await registerArea(areaCode.trim(), areaName.trim());
      await load();
    } catch {
      setNotice('권역 등록에 실패했습니다(이미 등록된 권역일 수 있습니다).');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(code: string) {
    setBusy(true);
    setNotice(null);
    try {
      await removeArea(code);
      await load();
    } catch {
      setNotice('권역 해제에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">활동 권역</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      {notice && (
        <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      <section className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold">권역 등록</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-500">권역 코드</span>
          <input
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            aria-label="권역 코드"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-500">권역명</span>
          <input
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            aria-label="권역명"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={handleRegister}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          등록
        </button>
      </section>

      {areas.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 권역이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {areas.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <span className="text-sm">
                <span className="font-semibold">{a.areaName}</span>
                <span className="ml-2 text-gray-400">{a.areaCode}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(a.areaCode)}
                disabled={busy}
                className="text-sm text-red-600 underline disabled:opacity-50"
              >
                해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
