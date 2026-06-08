import { create } from "zustand";
import type { InterestsState } from "./interests-store.types";
import {
  getCappedUniqueInterestIds,
  INTERESTS_DEFAULT_STATE,
  isInterestPersonalityType,
  toggleRejectedInterest,
  toggleSelectedInterest,
} from "./interests-store-model";

export const useInterestsStore = create<InterestsState>()((set) => ({
  ...INTERESTS_DEFAULT_STATE,

  toggle: (id, maxInterests) =>
    set((state) =>
      toggleSelectedInterest(
        state.selectedIds,
        state.rejectedIds,
        id,
        maxInterests,
      ),
    ),

  toggleReject: (id) =>
    set((state) => ({
      rejectedIds: toggleRejectedInterest(state.rejectedIds, id),
    })),

  replaceSelected: (ids, maxInterests) =>
    set(() => ({
      selectedIds: getCappedUniqueInterestIds(ids, maxInterests),
      rejectedIds: [],
    })),

  setScreen: (screen) => set({ screen }),

  setPersonalityType: (type) => {
    if (type && typeof type === "string" && isInterestPersonalityType(type)) {
      set({ personalityType: type });
    } else {
      set({ personalityType: null });
    }
  },

  reset: () => set(INTERESTS_DEFAULT_STATE),
}));
