import type { Dispatch, MutableRefObject } from "react";

import type { ForgeMode } from "@/features/forge/lib/forge-contract";
import type {
  ForgeWizardAction,
  ForgeWizardData,
  ForgeWizardField,
  Step,
} from "@/features/forge/lib/forge-wizard";

export type ForgeWizardDispatch = Dispatch<ForgeWizardAction>;
export type SetForgeWizardField = <Field extends ForgeWizardField>(
  field: Field,
  value: ForgeWizardData[Field],
) => void;

export interface ForgeWizardRouteSyncOptions {
  dispatch: ForgeWizardDispatch;
  routeActivityId: string | null;
  routeGroupId: string | null;
  routeMode: ForgeMode;
  routeStep: Step;
  state: ForgeWizardData;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
  }) => void;
}

export interface ForgeWizardRouteSyncResult {
  stepRef: MutableRefObject<Step>;
}
