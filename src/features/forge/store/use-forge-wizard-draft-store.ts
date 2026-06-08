import { create } from "zustand";

import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

interface ForgeWizardDraftStore {
  draft: ForgeWizardData | null;
  clearDraft: () => void;
  saveDraft: (draft: ForgeWizardData) => void;
}

export const useForgeWizardDraftStore = create<ForgeWizardDraftStore>(
  (set) => ({
    draft: null,
    clearDraft: () => set({ draft: null }),
    saveDraft: (draft) => set({ draft: cloneForgeWizardDraft(draft) }),
  }),
);

export function cloneForgeWizardDraft(draft: ForgeWizardData): ForgeWizardData {
  return {
    ...draft,
    participants: draft.participants.map((participant) => ({ ...participant })),
    removedIds: new Set(draft.removedIds),
    manualInviteeIds: [...draft.manualInviteeIds],
  };
}
