import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MBTI_SUGGESTIONS } from "../data/interests-data";
import type { InterestsScreen } from "../data/interests-types";
import type { PersonalityType } from "@/shared/schemas/enums";

// ─── Persisted state ──────────────────────────────────────────────────────────

interface PersistedState {
  selectedIds: string[];
  rejectedIds: string[];
  screen: InterestsScreen;
  personalityType: PersonalityType | null;
}

// ─── Full store ───────────────────────────────────────────────────────────────

interface InterestsState extends PersistedState {
  // Actions
  toggle: (id: string, maxInterests: number) => void;
  toggleReject: (id: string) => void;
  setScreen: (screen: InterestsScreen) => void;
  setPersonalityType: (type: PersonalityType | string | null) => void;
  addIds: (ids: string[], maxInterests: number) => void;
  reset: () => void;
}

const DEFAULT_STATE: PersistedState = {
  selectedIds: [],
  rejectedIds: [],
  screen: "intro",
  personalityType: null,
};

export const useInterestsStore = create<InterestsState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      toggle: (id, maxInterests) =>
        set((state) => {
          const current = new Set(state.selectedIds);
          const rejected = new Set(state.rejectedIds);

          if (current.has(id)) {
            current.delete(id);
          } else if (current.size < maxInterests) {
            current.add(id);
            // If we select a previously rejected tag, un-reject it
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

      setScreen: (screen) => set({ screen }),

      setPersonalityType: (type) => {
        const isPersonalityType = (t: string): t is PersonalityType =>
          t in MBTI_SUGGESTIONS;

        if (type && typeof type === "string" && isPersonalityType(type)) {
          set({ personalityType: type });
        } else {
          set({ personalityType: null });
        }
      },

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "tf_interests_v1_rev1",
      // Only persist these fields
      partialize: (state) => ({
        selectedIds: state.selectedIds,
        rejectedIds: state.rejectedIds,
        screen: state.screen,
        personalityType: state.personalityType,
      }),
    },
  ),
);
