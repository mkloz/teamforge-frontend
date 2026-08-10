import type { Dispatch, MutableRefObject } from "react";
import type {
  PlanBuilderAction,
  PlanBuilderData,
  PlanBuilderField,
  Step,
} from "@/features/plan-creation/lib/plan-builder";
import type { GroupFormationMode } from "@/features/plan-creation/lib/plan-creation-contract";
import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";

export type PlanBuilderDispatch = Dispatch<PlanBuilderAction>;
export type SetPlanBuilderField = <Field extends PlanBuilderField>(
  field: Field,
  value: PlanBuilderData[Field],
) => void;

export interface PlanBuilderRouteSyncOptions {
  consumeLaunch: (options?: { resetStep?: boolean }) => void;
  dispatch: PlanBuilderDispatch;
  enterGroupHub: (groupId: string) => Promise<void>;
  resetInvalidLaunch: () => void;
  routeActivityId: string | null;
  routeGroupId: string | null;
  routeIdea: PlanIdeaLaunch | null;
  routeMode: GroupFormationMode;
  routeStep: Step;
  state: PlanBuilderData;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
}

export interface PlanBuilderRouteSyncResult {
  stepRef: MutableRefObject<Step>;
}
