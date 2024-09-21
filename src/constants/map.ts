export type TKINDS_STATUS = {
  id: string;
  text: string;
  color: 'primary' | 'green' | 'cyan' | 'blue' | 'gray' | 'red' | 'black';
};
export const KINDS_STATUS: TKINDS_STATUS[] = [
  { id: '0', text: '세탁소', color: 'primary' },
  { id: '1', text: '건조기', color: 'blue' },
  { id: '2', text: '운동화', color: 'green' },
];
