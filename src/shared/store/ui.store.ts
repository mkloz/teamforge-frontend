import { create } from "zustand";

interface UiState {
  forgeOpen: boolean;
  bottomNavHidden: boolean;
  setForgeOpen: (open: boolean) => void;
  setBottomNavHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  forgeOpen: false,
  bottomNavHidden: false,
  setForgeOpen: (open) => set({ forgeOpen: open }),
  setBottomNavHidden: (hidden) => set({ bottomNavHidden: hidden }),
}));
