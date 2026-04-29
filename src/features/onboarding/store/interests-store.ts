import { create } from "zustand";
import { MBTI_SUGGESTIONS } from "../data/interests-data";
import type { InterestsScreen } from "../data/interests-types";
import type { PersonalityType } from "@/shared/schemas/enums";

// ─── Store state ──────────────────────────────────────────────────────────────

interface InterestsSnapshot {
  selectedIds: string[];
  rejectedIds: string[];
  screen: InterestsScreen;
  personalityType: PersonalityType | null;
}

// ─── Full store ───────────────────────────────────────────────────────────────

interface InterestsState extends InterestsSnapshot {
  // Actions
  toggle: (id: string, maxInterests: number) => void;
  toggleReject: (id: string) => void;
  setScreen: (screen: InterestsScreen) => void;
  setPersonalityType: (type: PersonalityType | string | null) => void;
  addIds: (ids: string[], maxInterests: number) => void;
  replaceSelected: (ids: string[], maxInterests: number) => void;
  reset: () => void;
}

const DEFAULT_STATE: InterestsSnapshot = {
  selectedIds: [],
  rejectedIds: [],
  screen: "intro",
  personalityType: null,
};

export const useInterestsStore = create<InterestsState>()((set) => ({
  ...DEFAULT_STATE,

  toggle: (id, maxInterests) =>
    set((state) => {
      const current = new Set(state.selectedIds);
      const rejected = new Set(state.rejectedIds);

      if (current.has(id)) {
        current.delete(id);
      } else if (current.size < maxInterests) {
        current.add(id);
        rejected.delete(id);
      }

      return {
        selectedIds: [...current],
        rejectedIds: [...rejected],
      };
    }),

  toggleReject: (id) =>
    set((state) => {
      const current = new Set(state.rejectedIds);

      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }

      return { rejectedIds: [...current] };
    }),

  addIds: (ids, maxInterests) =>
    set((state) => {
      const current = new Set(state.selectedIds);
      const rejected = new Set(state.rejectedIds);

      for (const id of ids) {
        if (current.size >= maxInterests) break;
        current.add(id);
        rejected.delete(id);
      }

      return {
        selectedIds: [...current],
        rejectedIds: [...rejected],
      };
    }),

  replaceSelected: (ids, maxInterests) =>
    set(() => {
      const nextSelected = Array.from(new Set(ids)).slice(0, maxInterests);

      return {
        selectedIds: nextSelected,
        rejectedIds: [],
      };
    }),

  setScreen: (screen) => set({ screen }),

  setPersonalityType: (type) => {
    const isPersonalityType = (value: string): value is PersonalityType =>
      value in MBTI_SUGGESTIONS;

    if (type && typeof type === "string" && isPersonalityType(type)) {
      set({ personalityType: type });
    } else {
      set({ personalityType: null });
    }
  },

  reset: () => set(DEFAULT_STATE),
}));
