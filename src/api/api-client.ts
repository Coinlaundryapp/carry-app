import returnFetch, { ReturnFetch } from 'return-fetch';
import returnFetchJson from 'return-fetch-json';

const returnFetchThrowingErrorByStatusCode: ReturnFetch = (args) =>
  returnFetch({
    ...args,
    interceptors: {
      response: async (response) => {
        if (response.status >= 400) {
          const msg = JSON.parse(await response.text()).message;
          throw new Error(msg);
        }
        return response;
      },
    },
  });

export const fetchExtended = returnFetchJson({
  jsonParser: JSON.parse,
  fetch: returnFetchThrowingErrorByStatusCode({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  }),
});
