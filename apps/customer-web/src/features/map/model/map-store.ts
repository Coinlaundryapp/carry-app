import { create } from 'zustand';
import type { TLaundromats } from '@features/map/types/map-type';

interface MapState {
  selectedMarkerId: number;
  selectedItem: TLaundromats | null;
  open: boolean;
  zoomLevel: number;
  isOffsetMarkerVisible: boolean;
  isUserMarkerVisible: boolean;
}

interface MapActions {
  setSelectedMarkerId: (id: number) => void;
  setSelectedItem: (item: TLaundromats | null) => void;
  setOpen: (open: boolean) => void;
  setZoomLevel: (level: number) => void;
  setIsOffsetMarkerVisible: (visible: boolean) => void;
  setIsUserMarkerVisible: (visible: boolean) => void;
  reset: () => void;
}

const initialState: MapState = {
  selectedMarkerId: 0,
  selectedItem: null,
  open: false,
  zoomLevel: 12,
  isOffsetMarkerVisible: true,
  isUserMarkerVisible: false,
};

export const useMapStore = create<MapState & MapActions>()((set) => ({
  ...initialState,
  setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setOpen: (open) => set({ open }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setIsOffsetMarkerVisible: (visible) => set({ isOffsetMarkerVisible: visible }),
  setIsUserMarkerVisible: (visible) => set({ isUserMarkerVisible: visible }),
  reset: () => set(initialState),
}));
