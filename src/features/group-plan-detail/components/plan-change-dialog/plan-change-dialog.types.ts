import type { usePlanChangeForm } from "@/features/group-plan-detail/components/plan-change-dialog/use-plan-change-form";
import type { planProposalFieldOptions } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";

export type PlanProposalFieldOption = (typeof planProposalFieldOptions)[number];
export type PlanChangeFormState = ReturnType<typeof usePlanChangeForm>;
