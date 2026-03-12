import { create } from 'zustand';

type ReviewStore = {
  text: string;
  setText: (text: string) => void;
  reset: () => void;
};

export const useReviewStore = create<ReviewStore>((set) => ({
  text: '',
  setText: (text) => set({ text }),
  reset: () => set({ text: '' }),
}));
