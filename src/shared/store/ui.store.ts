import { create } from "zustand";

interface UiState {
  planCreationOpen: boolean;
  bottomNavHidden: boolean;
  setPlanCreationOpen: (open: boolean) => void;
  setBottomNavHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  planCreationOpen: false,
  bottomNavHidden: false,
  setPlanCreationOpen: (open) => set({ planCreationOpen: open }),
  setBottomNavHidden: (hidden) => set({ bottomNavHidden: hidden }),
}));
