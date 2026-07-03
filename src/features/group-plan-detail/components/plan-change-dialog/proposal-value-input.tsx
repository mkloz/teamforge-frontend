import type { ReactNode } from "react";
import {
  CategoryProposalInput,
  DateTimeProposalInput,
  TextProposalInput,
} from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/basic-proposal-inputs";
import { CostProposalInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/cost-proposal-input";
import { LocationProposalInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/location-proposal-input";
import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import type { PlanProposalField } from "@/shared/schemas/enums";

type ProposalFieldRenderer = (props: ProposalValueInputProps) => ReactNode;

const PROPOSAL_FIELD_RENDERERS = {
  CATEGORY: CategoryProposalInput,
  COST: CostProposalInput,
  DATE_TIME: DateTimeProposalInput,
  DESCRIPTION: TextProposalInput,
  LOCATION: LocationProposalInput,
  TITLE: TextProposalInput,
} satisfies Record<PlanProposalField, ProposalFieldRenderer>;

export function ProposalValueInput(props: ProposalValueInputProps) {
  return PROPOSAL_FIELD_RENDERERS[props.field](props);
}
