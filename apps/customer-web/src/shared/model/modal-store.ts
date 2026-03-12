import { create } from 'zustand';

type ModalState = {
  isOpen: boolean;
  type: 'basic' | 'confirm';
  title: string;
  closeText: string;
  description?: string;
  confirmText?: string;
  image?: 'check' | 'sad' | '';
  onClose?: () => void;
  onConfirm?: () => void;
};
type ModalActions = {
  openModal: (modal: {
    type: 'basic' | 'confirm';
    title: string;
    closeText: string;
    description?: string;
    confirmText?: string;
    image?: 'check' | 'sad' | '';
    onClose?: () => void;
    onConfirm?: () => void;
  }) => void;
  closeModal: () => void;
};

type ModalStore = ModalState & ModalActions;
export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  type: 'basic',
  title: '',
  closeText: '취소',
  description: '',
  confirmText: '',
  image: '',
  onClose: () => {},
  onConfirm: () => {},
  openModal: (modal) => set({ ...modal, isOpen: true }),
  closeModal: () =>
    set({
      isOpen: false,
      type: 'basic',
      title: '',
      closeText: '취소',
      description: '',
      confirmText: '',
      image: '',
    }),
}));
