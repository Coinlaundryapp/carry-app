type Discount = {
  name: string;
  amount: number;
};

type Discounts = {
  laundryDiscounts: Discount[];
  deliveryDiscounts: Discount[];
};

type Charges = {
  laundryPrice: number;
  deliveryFee: number;
  serviceFee: number;
};

type ConfirmedPayment = {
  discounts: Discounts;
  charges: Charges;
  netAmount: number;
};

export type PaymentInfo = {
  id: number;
  orderedAt: string;
  confirmedPayment: ConfirmedPayment;
};
