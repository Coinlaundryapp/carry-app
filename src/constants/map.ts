export type TKINDS_STATUS = {
  id: 'WASHING_MACHINE' | 'DRYER' | 'SNEAKERS';
  text: string;
  color: 'primary' | 'green' | 'cyan' | 'blue' | 'gray' | 'red' | 'black';
};
export const KINDS_STATUS: TKINDS_STATUS[] = [
  { id: 'WASHING_MACHINE', text: '세탁소', color: 'primary' },
  { id: 'DRYER', text: '건조기', color: 'blue' },
  { id: 'SNEAKERS', text: '운동화', color: 'green' },
];
