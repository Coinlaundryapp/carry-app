export type TMetaData = {
  lat: string;
  lng: string;
};
export type TLaundromats = {
  id: number;
  address: string;
  distance: number;
  groupDeliveryFee: number;
  latitude: number;
  longitude: number;
  mediaResources: { extension: string; mediaUrl: string }[];
  name: string;
  options: ('WASHING_MACHINE' | 'DRYER' | 'SNEAKERS')[];
  reviewAverageRating: number;
  reviewCount: number;
  type?: string;
  individualDeliveryFee?: number;
};

export type MediaResource = {
  extension: string;
  mediaUrl: string;
};

export type ReviewData = {
  userId: string;
  content: string;
  day: string;
  text: string;
};
