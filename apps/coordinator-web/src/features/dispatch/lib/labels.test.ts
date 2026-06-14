import { canAssign, canCancel, dispatchStatusLabel } from './labels';

describe('dispatch labels', () => {
  it('상태를 한글 라벨로 바꾼다', () => {
    expect(dispatchStatusLabel('PENDING')).toBe('대기');
    expect(dispatchStatusLabel('ASSIGNED')).toBe('배정됨');
  });

  it('미지정 상태는 원문을 반환한다', () => {
    expect(dispatchStatusLabel('XYZ')).toBe('XYZ');
  });

  it('PENDING만 배정 가능하다', () => {
    expect(canAssign('PENDING')).toBe(true);
    expect(canAssign('ASSIGNED')).toBe(false);
  });

  it('진행 중 배차만 취소 가능하다', () => {
    expect(canCancel('PENDING')).toBe(true);
    expect(canCancel('ACCEPTED')).toBe(true);
    expect(canCancel('CANCELLED')).toBe(false);
    expect(canCancel('TIMEOUT')).toBe(false);
  });
});
