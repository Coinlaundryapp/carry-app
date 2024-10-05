import { ApiResponse, ServiceAvailabiltyRegionRes } from '@/types/api-types';
import { fetchExtended } from './api-client';

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
