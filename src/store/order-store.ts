import { SelectedOptions } from '@/types/laundry-type';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OrderOptionsState {
  washOptions: SelectedOptions;
  setWashOptions: (newOptions: Partial<SelectedOptions> | SelectedOptions) => void;
  resetOptions: () => void;
}

type TSelectedLaundromat = {
  address: string;
  distance: number;
  groupDeliveryFree: number;
  id: number;
  individualDeliveryFee: number;
  latitude: number;
  longitude: number;
  mediaResources: { extension: string; mediaUrl: string };
  name: string;
  options: 'WASHING_MACHINE' | 'DRYER' | 'SNEAKERS';
  reviewAverageRating: number;
  reviewCount: number;
};

type LaundromatState = {
  selectedLaundromat: TSelectedLaundromat | null;
  setSelectedLaundromat: (data: any) => void;
};

const useOrderOptionsStore = create<OrderOptionsState>()(
  persist(
    (set) => ({
      washOptions: {},
      setWashOptions: (newOptions) =>
        set((state) => ({
          washOptions: { ...state.washOptions, ...newOptions },
        })),
      resetOptions: () => set({ washOptions: {} }),
    }),
    {
      name: 'selected-options-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export const useLaundromatStore = create<LaundromatState>((set) => ({
  selectedLaundromat: null,
  setSelectedLaundromat: (data) => set({ selectedLaundromat: data }),
}));

export default useOrderOptionsStore;
