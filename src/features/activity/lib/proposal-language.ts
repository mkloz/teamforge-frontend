import { formatPlanLocationProposalValue } from "@/features/activity/lib/plan-location";
import type { PlanProposal } from "@/shared/schemas/plan";

export const PROPOSAL_FIELD_LABELS: Record<PlanProposal["field"], string> = {
  TITLE: "Title",
  DESCRIPTION: "Description",
  DATE_TIME: "Date & Time",
  LOCATION: "Location",
  COST: "Cost",
  CATEGORY: "Category",
};

export const PROPOSAL_STATUS_LABELS: Record<PlanProposal["status"], string> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
};

export function formatProposalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatProposalValue(
  field: PlanProposal["field"],
  value: string | null,
) {
  if (!value) {
    return "Not set";
  }

  if (field === "LOCATION") {
    return formatPlanLocationProposalValue(value);
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime()) && value.includes("T")) {
    return date.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return value;
}

export function buildProposalTimelineContent(proposal: PlanProposal) {
  return `${proposal.proposer.name} proposed updating ${PROPOSAL_FIELD_LABELS[proposal.field].toLowerCase()}`;
}

export function buildProposalSummaryText(proposal: PlanProposal) {
  return `${PROPOSAL_FIELD_LABELS[proposal.field]} proposed: ${formatProposalValue(proposal.field, proposal.proposedValue)}`;
}
