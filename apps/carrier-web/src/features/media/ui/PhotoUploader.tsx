'use client';

import { useState } from 'react';
import { uploadPhoto } from '@features/media/api/mediaApi';

interface PhotoUploaderProps {
  /** 업로드 분류 폴더(기본 'delivery'). */
  folder?: string;
  /** 업로드 성공 시 media id를 부모에 보고한다(부모가 photoIds 목록을 관리). */
  onUploaded: (mediaId: number) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * 단일 사진 업로드 — 파일 선택 → multipart 업로드 → media id를 부모로 보고. 모바일에선
 * `capture`로 카메라를 바로 띄운다. 배달 각 단계의 증빙 사진에 재사용한다.
 */
export function PhotoUploader({
  folder = 'delivery',
  onUploaded,
  disabled,
  label = '사진 추가',
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onUploaded(await uploadPhoto(file, folder));
    } catch {
      setError('사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="inline-flex cursor-pointer items-center justify-center rounded border border-dashed border-gray-400 px-3 py-2 text-sm text-gray-600">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          aria-label={label}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        {uploading ? '업로드 중…' : label}
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
