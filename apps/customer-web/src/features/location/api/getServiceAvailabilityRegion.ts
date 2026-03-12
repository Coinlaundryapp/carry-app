import { ApiResponse, ServiceAvailabiltyRegionRes } from '@shared/types/api-types';
import { fetchExtended } from '@shared/api/api-client';

export const getServiceAvailabiltyRegion = async () => {
  const res = await fetchExtended<ApiResponse<ServiceAvailabiltyRegionRes[]>>(
    '/api/v1/service-availability/regions',
    {
      method: 'GET',
    },
  );

  const data = res.body.data;
  return data;
};
