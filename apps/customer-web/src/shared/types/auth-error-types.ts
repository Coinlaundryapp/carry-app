export const AUTH_ERROR = {
  login_error: {
    title: '회원가입에 실패했어요!',
    description: '전화번호가 없으면 회원가입이 어려워요.',
    buttonText: '확인',
  },
  server_error: {
    title: '으악 오류가 났어요!',
    description: '웹을 껐다 다시 시도해주세요.',
    buttonText: '확인',
  },
  payment_error: {
    title: '결제 실패',
    description: '문제가 있었나 봐요. 다시 해볼까요?',
    buttonText: '결제 화면으로 돌아가기',
  },
};

export type AuthErrorType = keyof typeof AUTH_ERROR;
