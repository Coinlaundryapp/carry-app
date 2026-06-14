import type { Schemas } from '@carry/types';
import type { V2Client } from '@shared/api/v2-client';

export type UserProfile = Schemas['UserProfileResponse'];

/** 인증된 사용자 프로필 조회(`GET /api/v2/users/me`). */
export async function getMe(client: V2Client): Promise<UserProfile> {
  return client.request<UserProfile>('/api/v2/users/me', { method: 'GET', cache: 'no-cache' });
}
