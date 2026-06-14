import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import { uploadPhoto } from './mediaApi';

describe('mediaApi.uploadPhoto', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('파일을 multipart로 업로드하고 media id를 반환한다', async () => {
    let contentType: string | null = null;
    let folder: string | undefined;
    server.use(
      http.post('*/api/v2/media/upload/:folder', ({ request, params }) => {
        contentType = request.headers.get('Content-Type');
        folder = params.folder as string;
        return HttpResponse.json({
          data: { id: 42, accessKey: 'uuid', folder: 'delivery' },
          status: 201,
          code: 'CREATED',
          message: 'ok',
        });
      }),
    );
    const file = new File(['bytes'], 'pickup.jpg', { type: 'image/jpeg' });
    const id = await uploadPhoto(file, 'delivery');

    expect(id).toBe(42);
    expect(folder).toBe('delivery');
    // multipart는 brower/undici가 boundary 포함 Content-Type을 자동 설정한다.
    expect(contentType).toMatch(/multipart\/form-data/);
  });
});
