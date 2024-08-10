import create from 'zustand';

interface AddressStore {
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: '',
  setSelectedAddress: (address) => set({ selectedAddress: address }),
}));
