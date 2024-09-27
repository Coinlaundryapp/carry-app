import { DrayerIcon, SneakerIcon, WashIcon } from '@assets/icons';

export type TKINDS_STATUS = {
  id: 'WASHING_MACHINE' | 'DRYER' | 'SNEAKERS';
  component: React.ElementType;
};
export const KINDS_STATUS: TKINDS_STATUS[] = [
  { id: 'WASHING_MACHINE', component: WashIcon },
  { id: 'DRYER', component: DrayerIcon },
  { id: 'SNEAKERS', component: SneakerIcon },
];
