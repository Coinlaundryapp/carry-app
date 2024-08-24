export const AUTH_ERROR = {
  login_error: {
    title: '회원가입에 실패했어요!',
    description: '전화번호가 없으면 회원가입이 어려워요.',
  },
  server_error: {
    title: '으악 오류가 났어요!',
    description: '웹을 껐다 다시 시도해주세요.',
  },
} as const;

export type AuthErrorType = keyof typeof AUTH_ERROR;
