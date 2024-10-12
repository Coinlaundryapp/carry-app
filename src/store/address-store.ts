import { create } from 'zustand';

interface AddressStore {
  selectedAddressId: number | null;
  setSelectedAddressId: (address: number) => void;
  addressModalOpen: boolean;
  setAddressModalOpen: (isOpen: boolean) => void;
  shouldRefetch: boolean;
  setShouldRefetch: (shouldRefetch: boolean) => void;
  triggerRefetch: () => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddressId: null,
  setSelectedAddressId: (address) => set({ selectedAddressId: address }),
  addressModalOpen: false,
  setAddressModalOpen: (isOpen) => set({ addressModalOpen: isOpen }),
  shouldRefetch: false,
  setShouldRefetch: (value) => set({ shouldRefetch: value }),
  triggerRefetch: () => set((state) => ({ shouldRefetch: !state.shouldRefetch })),
}));
