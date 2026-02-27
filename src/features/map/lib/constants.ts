import { DrayerIcon, SneakerIcon, WashIcon } from '@assets/icons';

/** localStorage 키 상수 */
export const STORAGE_KEYS = {
  TEMP_REGION: '임시설정구역',
  DELIVERY_ADDRESS: '배송지',
} as const;

export type TKINDS_STATUS = {
  id: 'WASHING_MACHINE' | 'DRYER' | 'SNEAKERS';
  component: React.ElementType;
};
export const KINDS_STATUS: TKINDS_STATUS[] = [
  { id: 'WASHING_MACHINE', component: WashIcon },
  { id: 'DRYER', component: DrayerIcon },
  { id: 'SNEAKERS', component: SneakerIcon },
];
