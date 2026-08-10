import { create } from "zustand";

import type { PlanBuilderData } from "@/features/plan-creation/lib/plan-builder";
import {
  clearPlanBuilderSession,
  writePlanBuilderDraft,
} from "./plan-builder-session-storage";

interface PlanBuilderDraftStore {
  draft: PlanBuilderData | null;
  clearDraft: () => void;
  saveDraft: (draft: PlanBuilderData) => void;
}

export const usePlanBuilderDraftStore = create<PlanBuilderDraftStore>(
  (set) => ({
    draft: null,
    clearDraft: () => {
      clearPlanBuilderSession();
      set({ draft: null });
    },
    saveDraft: (draft) => {
      const cloned = clonePlanBuilderDraft(draft);
      writePlanBuilderDraft(cloned);
      set({ draft: cloned });
    },
  }),
);

export function clonePlanBuilderDraft(draft: PlanBuilderData): PlanBuilderData {
  return {
    ...draft,
    participants: draft.participants.map((participant) => ({ ...participant })),
    removedIds: new Set(draft.removedIds),
    manualInviteeIds: [...draft.manualInviteeIds],
  };
}
