import { create } from "zustand";

interface UiState {
  searchOpen: boolean;
  notificationsOpen: boolean;
  forgeOpen: boolean;
  bottomNavHidden: boolean;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setForgeOpen: (open: boolean) => void;
  setBottomNavHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchOpen: false,
  notificationsOpen: false,
  forgeOpen: false,
  bottomNavHidden: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setForgeOpen: (open) => set({ forgeOpen: open }),
  setBottomNavHidden: (hidden) => set({ bottomNavHidden: hidden }),
}));
