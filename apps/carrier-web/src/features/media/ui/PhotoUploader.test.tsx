import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import { PhotoUploader } from './PhotoUploader';

describe('PhotoUploader', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('파일 선택 시 업로드하고 media id를 보고한다', async () => {
    server.use(
      http.post('*/api/v2/media/upload/:folder', () =>
        HttpResponse.json({
          data: { id: 99, accessKey: 'k' },
          status: 201,
          code: 'CREATED',
          message: 'ok',
        }),
      ),
    );
    const onUploaded = vi.fn();
    render(<PhotoUploader onUploaded={onUploaded} />);

    const file = new File(['x'], 'p.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('사진 추가'), file);

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(99));
  });

  it('업로드 실패 시 에러를 표시하고 보고하지 않는다', async () => {
    server.use(
      http.post('*/api/v2/media/upload/:folder', () =>
        HttpResponse.json({ status: 500, code: 'ERROR', message: 'x' }, { status: 500 }),
      ),
    );
    const onUploaded = vi.fn();
    render(<PhotoUploader onUploaded={onUploaded} />);

    await userEvent.upload(
      screen.getByLabelText('사진 추가'),
      new File(['x'], 'p.jpg', { type: 'image/jpeg' }),
    );

    expect(await screen.findByText(/업로드에 실패/)).toBeInTheDocument();
    expect(onUploaded).not.toHaveBeenCalled();
  });
});
