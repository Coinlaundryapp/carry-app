import * as Sentry from '@sentry/nextjs';
import returnFetch, { ReturnFetch } from 'return-fetch';
import returnFetchJson from 'return-fetch-json';
import { env } from '@shared/config/env';

export class ApiError extends Error {
  status: number;
  url: string;
  body: string;

  constructor(status: number, url: string, body: string) {
    super(`[${status}] ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

const returnFetchThrowingErrorByStatusCode: ReturnFetch = (args) =>
  returnFetch({
    ...args,
    interceptors: {
      response: async (response) => {
        if (response.status >= 400) {
          const body = await response
            .clone()
            .text()
            .catch(() => '');
          const apiError = new ApiError(response.status, response.url, body.slice(0, 500));
          Sentry.addBreadcrumb({
            category: 'api',
            message: `${response.status} ${response.url}`,
            level: 'error',
            data: { body: body.slice(0, 200) },
          });
          throw apiError;
        }
        return response;
      },
    },
  });

export const fetchExtended = returnFetchJson({
  jsonParser: JSON.parse,
  fetch: returnFetchThrowingErrorByStatusCode({
    baseUrl: env.NEXT_PUBLIC_BACKEND_URL,
  }),
});
