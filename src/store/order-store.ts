import { OrderContent, OrderSchedule } from '@/types/laundry-type';
import { TLaundromats } from '@/types/map-type';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OrderState {
  orderContent: OrderContent;
  totalAmount: number;
  step: number;
  laundromat: TLaundromats | null;
  orderSchedule: OrderSchedule;
  addressId: number | null;
  setAddressId: (addressId: number) => void;
  setLaundryromat: (laundromat: TLaundromats) => void;
  setOrderSchedule: (schedule: OrderSchedule) => void;
  setOrderContent: (newOptions: OrderContent | Partial<OrderContent>) => void;
  addTotalAmount: (amount: number) => void;
  removeTotalAmount: (amount: number) => void;
  setStep: (step: number) => void;
  reset: (
    orderUnitType?: OrderContent['orderUnitType'],
    orderRequestType?: OrderContent['orderRequestType'],
    laundryItemType?: OrderContent['laundryItemType'],
  ) => void;
}

const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orderContent: {
        orderUnitType: null,
        orderRequestType: null,
        laundryItemType: null,
        laundrySpecs: [],
        washOption: null,
        dryOption: null,
        additionalOptions: [],
      },
      step: 0,
      totalAmount: 0,
      laundromat: null,
      addressId: null,
      orderSchedule: {
        desiredPickupDateTime: '',
        desiredDeliveryDateTime: '',
      },
      setAddressId: (addressId) =>
        set(() => ({
          addressId,
        })),

      setLaundryromat: (laundromat) =>
        set(() => ({
          laundromat,
        })),
      setOrderContent: (newOptions) =>
        set((state) => ({
          orderContent: { ...state.orderContent, ...newOptions },
        })),
      addTotalAmount: (amount) =>
        set((state) => ({
          totalAmount: state.totalAmount + amount,
        })),
      removeTotalAmount: (amount) =>
        set((state) => ({
          totalAmount: state.totalAmount - amount,
        })),
      setStep: (step) =>
        set((state) => ({
          step,
        })),

      setOrderSchedule: (schedule) =>
        set((state) => ({
          orderSchedule: schedule,
        })),
      reset: (
        orderUnitType: OrderContent['orderUnitType'] = null,
        orderRequestType: OrderContent['orderRequestType'] = null,
        laundryItemType: OrderContent['laundryItemType'] = null,
      ) =>
        set({
          orderContent: {
            orderUnitType,
            orderRequestType,
            laundryItemType,
            laundrySpecs: [],
            washOption: null,
            dryOption: null,
            additionalOptions: [],
          },
          totalAmount: 0,
          step: 0,
          laundromat: null,
          orderSchedule: {
            desiredPickupDateTime: '',
            desiredDeliveryDateTime: '',
          },
        }),
    }),
    {
      name: 'selected-options-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useOrderStore;
