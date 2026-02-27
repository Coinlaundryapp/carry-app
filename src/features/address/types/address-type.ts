export type GetAddressesResType = AddressListItem[];

export type AddressListItem = {
  addressId: number;
  addressLabel: string;
  fullAddress: string;
  isDefault: boolean;
};

/** @deprecated AddressListItem으로 대체 */
export type AddressType = AddressListItem;

/** POST/PUT 요청 시 사용하는 주소 페이로드 */
export type AddressPayload = {
  addressLabel: string;
  recipientPhone: string;
  recipientName: string;
  baseAddress: string;
  detailAddress: string;
  deliveryNotes: string;
  entranceType: string;
  entranceDetail: string;
};
