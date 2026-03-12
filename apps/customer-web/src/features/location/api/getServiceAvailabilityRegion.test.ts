import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import { getServiceAvailabiltyRegion } from './getServiceAvailabilityRegion';

describe('getServiceAvailabiltyRegion', () => {
  it('정상 → 서비스 가능 지역 배열 반환', async () => {
    const result = await getServiceAvailabiltyRegion();
    expect(result).toEqual(mockData.serviceRegions);
  });

  it('서버 에러 → ApiError 발생', async () => {
    server.use(
      http.get('*/api/v1/service-availability/regions', () => {
        return HttpResponse.json(
          { data: null, status: 500, message: 'Internal Server Error' },
          { status: 500 },
        );
      }),
    );

    await expect(getServiceAvailabiltyRegion()).rejects.toThrow();
  });
});
