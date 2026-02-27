import { TLaundromats, TMetaData } from '@features/map/types/map-type';
import { fetchExtended } from '@shared/api/api-client';
import { ApiResponse } from '@shared/types/api-types';

export async function getLaundromats(mapData: TMetaData) {
  const res = await fetchExtended<ApiResponse<TLaundromats[]>>(
    `/api/v1/laundromats?latitude=${mapData.lat}&longitude=${mapData.lng}`,
    {
      method: 'GET',
    },
  );

  const data = res.body.data;
  return data;
}
