import type { Schemas } from '@carry/types';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 미디어 API — `POST /api/v2/media/upload/{folder}`(multipart `file`). 배달 각 단계의
 * 사진 증빙을 업로드하고 media id를 받아 delivery 명령(pickup/washing/drying/delivery)의
 * `photoIds`로 넘긴다.
 *
 * `@carry/api` 클라이언트는 body가 FormData면 직렬화/Content-Type을 건드리지 않고 그대로
 * 보낸다(undici가 boundary 포함 multipart 헤더를 자동 설정).
 */

export type Media = Schemas['MediaResponse'];

/** 파일을 업로드하고 media id를 반환한다. folder는 분류용(기본 'delivery'). */
export async function uploadPhoto(file: File, folder = 'delivery'): Promise<number> {
  const client = createV2Client();
  const form = new FormData();
  form.append('file', file);
  const media = await client.request<Media>(`/api/v2/media/upload/${folder}`, {
    method: 'POST',
    body: form,
  });
  return media.id;
}
