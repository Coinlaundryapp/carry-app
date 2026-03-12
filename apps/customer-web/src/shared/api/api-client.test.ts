import { describe, it, expect } from 'vitest';
import { ApiError } from './api-client';

describe('ApiError', () => {
  it('status, url, body 프로퍼티가 올바르게 설정됨', () => {
    const error = new ApiError(404, 'https://api.example.com/users', 'Not Found');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.url).toBe('https://api.example.com/users');
    expect(error.body).toBe('Not Found');
  });

  it('메시지 형식: [status] url', () => {
    const error = new ApiError(500, 'https://api.example.com/data', 'Internal Server Error');
    expect(error.message).toBe('[500] https://api.example.com/data');
  });

  it('다양한 HTTP 상태 코드 처리', () => {
    const errors = [
      new ApiError(400, '/bad-request', ''),
      new ApiError(401, '/unauthorized', ''),
      new ApiError(403, '/forbidden', ''),
      new ApiError(422, '/unprocessable', ''),
      new ApiError(500, '/server-error', ''),
    ];

    expect(errors.map((e) => e.status)).toEqual([400, 401, 403, 422, 500]);
  });

  it('catch 블록에서 타입 가드 사용 가능', () => {
    const error: unknown = new ApiError(422, '/login', '{"error":"invalid"}');

    if (error instanceof ApiError) {
      expect(error.status).toBe(422);
      expect(error.body).toBe('{"error":"invalid"}');
    } else {
      throw new Error('ApiError 타입 가드 실패');
    }
  });
});
