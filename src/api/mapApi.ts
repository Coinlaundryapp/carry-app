import { TLaundromats, TMetaData } from '@/types/map-type';
import { fetchExtended } from './api-client';
import { ApiResponse } from '@/types/api-types';

export async function getLaundromats(mapData: TMetaData) {
  console.log('ma', mapData);
  const res = await fetchExtended<ApiResponse<TLaundromats[]>>(
    `/api/v1/laundromats?latitude=${mapData.lat}&longitude=${mapData.lng}`,
    {
      method: 'GET',
    },
  );

  const data = res.body.data;
  return data;
}
