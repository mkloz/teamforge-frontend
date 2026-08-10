import type {
  PlanBuilderData,
  Step,
} from "@/features/plan-creation/lib/plan-builder";
import type { FormationLocationContext } from "../group-formation-execution-input";

import type {
  PlanBuilderDispatch,
  SetPlanBuilderField,
} from "../plan-builder-hook.types";

export type GroupFormationExecutionMode = "AUTO" | "MANUAL";

export interface UsePlanBuilderSubmitActionsOptions {
  close: () => void;
  dispatch: PlanBuilderDispatch;
  enterGroupHub: (groupId: string) => Promise<void>;
  goNext: () => void;
  locationContext: FormationLocationContext;
  runPlanCreationAnimation: (onComplete: () => void | Promise<void>) => void;
  setField: SetPlanBuilderField;
  state: PlanBuilderData;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
}
