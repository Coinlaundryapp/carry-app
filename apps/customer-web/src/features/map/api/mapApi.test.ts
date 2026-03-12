import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import { getLaundromats } from './mapApi';

describe('mapApi', () => {
  describe('getLaundromats', () => {
    it('좌표 전달 → 세탁소 배열 반환', async () => {
      const result = await getLaundromats({ lat: '37.5065', lng: '127.0536' });
      expect(result).toEqual(mockData.laundromats);
    });

    it('빈 결과 → 빈 배열', async () => {
      server.use(
        http.get('*/api/v1/laundromats', () => {
          return HttpResponse.json({ data: [], status: 200, message: 'success' }, { status: 200 });
        }),
      );

      const result = await getLaundromats({ lat: '0', lng: '0' });
      expect(result).toEqual([]);
    });
  });
});
