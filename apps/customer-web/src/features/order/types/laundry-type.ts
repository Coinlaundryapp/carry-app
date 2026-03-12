export type LaundryItemType = 'REGULAR' | 'BLANKET' | 'REGULAR_AND_BLANKET' | 'SHOES';
export type OrderUnitType = 'SOLO' | 'ECONOMY' | 'TEAM';
export type OrderRequestType = 'NEW' | 'JOIN';
export type WashOption = 'STANDARD' | 'HOT_WATER';
export type DryOption = 'LOW_HEAT' | 'HIGH_HEAT';
export type AdditionalOption = 'FOLD_LAUNDRY' | 'ADD_SOFTENER';
export type LaundryTask = 'WASH' | 'DRY' | 'WASH_AND_DRY';
export type OrderDetailStatus =
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'DELIVERY_COMPLETED'
  | 'REFUND_PENDING'
  | 'REFUND_REQUEST_CANCELED'
  | 'REFUND_COMPLETED';
export type LaundrySpec = {
  laundrySpec: string;
  value: number;
};

export type OrderContent = {
  orderUnitType: OrderUnitType | null;
  orderRequestType: OrderRequestType | null;
  laundryItemType: LaundryItemType | null;
  laundrySpecs: LaundrySpec[];
  washOption: WashOption | null;
  dryOption: DryOption | null;
  additionalOptions: AdditionalOption[];
};
export type OrderSchedule = {
  desiredPickupDateTime: string;
  desiredDeliveryDateTime: string;
};

export interface LaundryOptions {
  name: string;
  description?: string;
  price?: number | null;
  icon: JSX.Element;
  value: string;
  selectable: boolean;
}
interface OptionItem {
  selectable: boolean;
  price: number | null;
}

export interface LaundryPriceData {
  washOption: {
    standard: OptionItem;
    hotWater: OptionItem;
  };
  dryOption: {
    lowHeat: OptionItem;
    highHeat: OptionItem;
  };
  additionalOption: {
    foldLaundry: OptionItem;
    addSoftener: OptionItem;
  };
}

export type OrderResponse = {
  id: number;
  status: OrderDetailStatus;
  orderUnitType: OrderUnitType;
  orderRequestType: OrderRequestType;
  laundryItemType: LaundryItemType;
  laundromatName: string;
  orderedAt: string;
  estimatedAmount: number;
};
