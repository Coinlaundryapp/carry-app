import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { registerBillingKey, getMyBillingKey } from './billing';

const TOKEN = 'test-access-token';

describe('registerBillingKey', () => {
  it('authKey로 등록하고 마스킹 카드를 반환한다', async () => {
    server.use(
      http.post('*/api/v2/billing-keys', () =>
        HttpResponse.json(
          {
            status: 201,
            code: 'OK',
            message: '',
            data: {
              cardCompany: '신한',
              cardLast4: '1234',
              registeredAt: '2026-07-13T00:00:00Z',
            },
          },
          { status: 201 },
        ),
      ),
    );
    const result = await registerBillingKey({ accessToken: TOKEN, authKey: 'mock-x' });
    expect(result).toEqual({
      cardCompany: '신한',
      cardLast4: '1234',
      registeredAt: '2026-07-13T00:00:00Z',
    });
  });
});

describe('getMyBillingKey', () => {
  it('등록 카드를 반환한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          {
            status: 200,
            code: 'OK',
            message: '',
            data: {
              cardCompany: '국민',
              cardLast4: '5678',
              registeredAt: '2026-07-13T00:00:00Z',
            },
          },
          { status: 200 },
        ),
      ),
    );
    expect(await getMyBillingKey({ accessToken: TOKEN })).toMatchObject({ cardLast4: '5678' });
  });

  it('404면 null을 반환한다(카드 없음)', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          { status: 404, code: 'BILLING_KEY_NOT_FOUND', message: '없음' },
          { status: 404 },
        ),
      ),
    );
    expect(await getMyBillingKey({ accessToken: TOKEN })).toBeNull();
  });
});
