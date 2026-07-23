import type { ForgeWizardData, Step } from "@/features/forge/lib/forge-wizard";

import type {
  ForgeWizardDispatch,
  SetForgeWizardField,
} from "../forge-wizard-hook.types";

export type ForgeExecutionMode = "AUTO" | "MANUAL";

export interface UseForgeWizardSubmitActionsOptions {
  close: () => void;
  dispatch: ForgeWizardDispatch;
  enterGroupHub: (groupId: string) => Promise<void>;
  goNext: () => void;
  runForgeAnimation: (onComplete: () => void | Promise<void>) => void;
  setField: SetForgeWizardField;
  state: ForgeWizardData;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
}
