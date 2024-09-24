import { fetchExtended } from './api-client';
import { ApiResponse } from '@/types/api-types';

export async function getLaundromats(accessToken: string | undefined, mapData: any) {
  const res = await fetchExtended<ApiResponse<any>>(
    `/api/v1/laundromats?latitude=${mapData.lat}&longitude=${mapData.lng}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = res.body.data;
  return data;
}
