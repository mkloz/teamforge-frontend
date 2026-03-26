import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MBTI_SUGGESTIONS } from "../data/interests-data";
import type { InterestsScreen, MbtiType } from "../data/interests-types";

// ─── Persisted state ──────────────────────────────────────────────────────────

interface PersistedState {
  selectedIds: string[];
  rejectedIds: string[];
  screen: InterestsScreen;
  mbtiType: MbtiType | null;
}

// ─── Full store ───────────────────────────────────────────────────────────────

interface InterestsState extends PersistedState {
  // Actions
  toggle: (id: string, maxInterests: number) => void;
  toggleReject: (id: string) => void;
  setScreen: (screen: InterestsScreen) => void;
  setMbtiType: (type: MbtiType | string | null) => void;
  addIds: (ids: string[], maxInterests: number) => void;
  reset: () => void;
}

const DEFAULT_STATE: PersistedState = {
  selectedIds: [],
  rejectedIds: [],
  screen: "intro",
  mbtiType: null,
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

      setMbtiType: (type) => {
        // Guard against unknown types
        if (type && !(type in MBTI_SUGGESTIONS)) return;
        set({ mbtiType: type as MbtiType });
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
        mbtiType: state.mbtiType,
      }),
    },
  ),
);
