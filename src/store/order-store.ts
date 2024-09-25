import { SelectedOptions } from '@/types/laundry-type';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OrderOptionsState {
  washOptions: SelectedOptions;
  setWashOptions: (newOptions: Partial<SelectedOptions> | SelectedOptions) => void;
  resetOptions: () => void;
}

type LaundromatState = {
  selectedLaundromat: any | null;
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
