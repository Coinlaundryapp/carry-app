export type PaymentMethod = 'KAKAOPAY' | 'NAVERPAY' | 'card';

export const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: '카카오페이', value: 'KAKAOPAY' },
  { label: '네이버페이', value: 'NAVERPAY' },
  { label: '일반 결제(카드사 앱 결제)', value: 'card' },
];

export const CARD_INSTITUTIONS = [
  { label: '기업 BC', value: 'IBK_BC' },
  { label: '광주은행', value: 'GWANGJUBANK' },
  { label: '롯데카드', value: 'LOTTE' },
  { label: 'KDB산업은행', value: 'KDBBANK' },
  { label: 'BC카드', value: 'BC' },
  { label: '삼성카드', value: 'SAMSUNG' },
  { label: '새마을금고', value: 'SAEMAUL' },
  { label: '신한카드', value: 'SHINHAN' },
  { label: '신협', value: 'SHINHYEOP' },
  { label: '씨티카드', value: 'CITI' },
  { label: '우리카드', value: 'WOORI' },
  { label: '우체국예금보험', value: 'POST' },
  { label: '저축은행중앙회', value: 'SAVINGBANK' },
  { label: '전북은행', value: 'JEONBUKBANK' },
  { label: '제주은행', value: 'JEJUBANK' },
  { label: '카카오뱅크', value: 'KAKAOBANK' },
  { label: '케이뱅크', value: 'KBANK' },
  { label: '토스뱅크', value: 'TOSSBANK' },
  { label: '하나카드', value: 'HANA' },
  { label: '현대카드', value: 'HYUNDAI' },
  { label: 'KB국민카드', value: 'KOOKMIN' },
  { label: 'NH농협카드', value: 'NONGHYEOP' },
  { label: 'Sh수협은행', value: 'SUHYEOP' },
  { label: '페이코', value: 'PCP' },
  { label: 'KB증권', value: 'KBS' },
] as const;

export const INSTALLMENT_OPTIONS = [
  { value: '0', label: '일시불' },
  { value: '2', label: '2개월' },
  { value: '3', label: '3개월' },
  { value: '4', label: '4개월' },
  { value: '5', label: '5개월' },
  { value: '6', label: '6개월' },
  { value: '7', label: '7개월' },
  { value: '8', label: '8개월' },
  { value: '9', label: '9개월' },
  { value: '10', label: '10개월' },
  { value: '11', label: '11개월' },
  { value: '12', label: '12개월' },
] as const;
