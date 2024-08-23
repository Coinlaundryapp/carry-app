import create from 'zustand';

interface AddressStore {
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  addressModalOpen: boolean;
  setAddressModalOpen: (isOpen: boolean) => void;
  shouldRefetch: boolean;
  setShouldRefetch: (shouldRefetch: boolean) => void;
  triggerRefetch: () => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: '',
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  addressModalOpen: false,
  setAddressModalOpen: (isOpen) => set({ addressModalOpen: isOpen }),
  shouldRefetch: false,
  setShouldRefetch: (value) => set({ shouldRefetch: value }),
  triggerRefetch: () => set((state) => ({ shouldRefetch: !state.shouldRefetch })),
}));
