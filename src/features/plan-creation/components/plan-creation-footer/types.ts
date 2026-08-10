import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";

export interface PlanBuilderFooterProps {
  fw: PlanBuilderState;
  onDisabledStep1Continue: () => void;
}

export interface PlanBuilderFooterChildProps {
  fw: PlanBuilderState;
}
