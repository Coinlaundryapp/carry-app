import { create } from 'zustand';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'done' | 'error';
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: ({ message, type = 'success', duration = 2000 }) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          message,
          type,
          duration,
          id: Date.now().toString(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
