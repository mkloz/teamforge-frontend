import type { PlanBuilderChildProps } from "../types";
import type { useInlinePlanStepActions } from "../use-inline-plan-step-actions";

export interface InlinePlanStepContentProps extends PlanBuilderChildProps {
  activityShakeRequestId: number;
}

export type InlinePlanStepActions = ReturnType<typeof useInlinePlanStepActions>;

export interface CurrentPlanCreationStepProps
  extends InlinePlanStepContentProps {
  actions: InlinePlanStepActions;
}
