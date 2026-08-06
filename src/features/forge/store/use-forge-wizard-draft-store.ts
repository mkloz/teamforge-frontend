import { create } from "zustand";

import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";
import {
  clearForgeWizardSession,
  writeForgeWizardDraft,
} from "./forge-wizard-session-storage";

interface ForgeWizardDraftStore {
  draft: ForgeWizardData | null;
  clearDraft: () => void;
  saveDraft: (draft: ForgeWizardData) => void;
}

export const useForgeWizardDraftStore = create<ForgeWizardDraftStore>(
  (set) => ({
    draft: null,
    clearDraft: () => {
      clearForgeWizardSession();
      set({ draft: null });
    },
    saveDraft: (draft) => {
      const cloned = cloneForgeWizardDraft(draft);
      writeForgeWizardDraft(cloned);
      set({ draft: cloned });
    },
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
