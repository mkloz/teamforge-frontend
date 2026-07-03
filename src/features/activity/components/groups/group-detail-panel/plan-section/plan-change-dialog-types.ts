import type { PLAN_PROPOSAL_FIELD_OPTIONS } from "./plan-proposal-fields";
import type { usePlanProposalForm } from "./use-plan-proposal-form";

export type PlanProposalForm = ReturnType<typeof usePlanProposalForm>;
export type PlanProposalFieldOption =
  (typeof PLAN_PROPOSAL_FIELD_OPTIONS)[number];
export type ProposalLocationValue = PlanProposalForm["locationValue"];

export interface PlanLocationSelection {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}
