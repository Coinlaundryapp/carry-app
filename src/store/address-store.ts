import create from 'zustand';

interface AddressStore {
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  addressModalOpen: boolean;
  setAddressModalOpen: (isOpen: boolean) => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: '',
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  addressModalOpen: false,
  setAddressModalOpen: (isOpen) => set({ addressModalOpen: isOpen }),
}));
