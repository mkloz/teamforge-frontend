import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";

export interface InlinePlanBuilderProps {
  onCancel: () => void;
}

export interface PlanBuilderChildProps {
  fw: PlanBuilderState;
}
