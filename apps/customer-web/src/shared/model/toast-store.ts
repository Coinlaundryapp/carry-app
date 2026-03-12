import { create } from 'zustand';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'done' | 'error';
  duration?: number;
} | null;

type ToastStore = {
  toast: Toast;
  addToast: (toast: Omit<NonNullable<Toast>, 'id'>) => void;
  removeToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  addToast: ({ message, type = 'success', duration = 2000 }) =>
    set(() => ({
      toast: {
        message,
        type,
        duration,
        id: Date.now().toString(),
      },
    })),
  removeToast: () => set({ toast: null }),
}));
