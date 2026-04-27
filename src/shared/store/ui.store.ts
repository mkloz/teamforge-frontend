import { create } from "zustand";

interface UiState {
  notificationsOpen: boolean;
  forgeOpen: boolean;
  bottomNavHidden: boolean;
  setNotificationsOpen: (open: boolean) => void;
  setForgeOpen: (open: boolean) => void;
  setBottomNavHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  notificationsOpen: false,
  forgeOpen: false,
  bottomNavHidden: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setForgeOpen: (open) => set({ forgeOpen: open }),
  setBottomNavHidden: (hidden) => set({ bottomNavHidden: hidden }),
}));
