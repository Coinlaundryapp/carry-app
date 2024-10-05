import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Location {
  lat: number;
  lng: number;
}

interface LocationStore {
  location: Location;
  setLocation: (lat: number, lng: number) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: {
        lat: 0,
        lng: 0,
      },
      setLocation: (lat: number, lng: number) =>
        set(() => ({
          location: { lat, lng },
        })),
    }),
    {
      name: 'location-storage',
    },
  ),
);
