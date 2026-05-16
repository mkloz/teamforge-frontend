import { z } from "zod";
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
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
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

  if (field === "COST") {
    return formatCostProposalValue(value);
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

type CostProposalValue = {
  cost: "FREE" | "PAID";
  costAmount: number | null;
  costDetails: string | null;
};

const costProposalValueSchema = z
  .object({
    cost: z.enum(["FREE", "PAID"]),
    costAmount: z.number().finite().nullable().optional(),
    costDetails: z.string().nullable().optional(),
  })
  .transform(
    (value): CostProposalValue => ({
      cost: value.cost,
      costAmount: value.costAmount ?? null,
      costDetails:
        typeof value.costDetails === "string" &&
        value.costDetails.trim().length > 0
          ? value.costDetails.trim()
          : null,
    }),
  );

function formatCostProposalValue(value: string) {
  const parsedValue = parseCostProposalValue(value);

  if (!parsedValue) {
    return value;
  }

  const details = parsedValue.costDetails;

  if (parsedValue.cost === "FREE") {
    return details ? `Free \u00b7 ${details}` : "Free";
  }

  const amount =
    parsedValue.costAmount === null
      ? null
      : `About \u00a3${formatCostAmount(parsedValue.costAmount)}`;

  if (amount && details) {
    return `${amount} \u00b7 ${details}`;
  }

  return amount ?? details ?? "Paid";
}

function parseCostProposalValue(value: string): CostProposalValue | null {
  const trimmedValue = value.trim();

  if (trimmedValue === "FREE" || trimmedValue === "PAID") {
    return { cost: trimmedValue, costAmount: null, costDetails: null };
  }

  let result: ReturnType<typeof costProposalValueSchema.safeParse>;

  try {
    result = costProposalValueSchema.safeParse(JSON.parse(value));
  } catch {
    return null;
  }

  return result.success ? result.data : null;
}

function formatCostAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function buildProposalTimelineContent(proposal: PlanProposal) {
  return `${proposal.proposer.name} proposed updating ${getProposalTimelineFieldLabel(proposal.field)}`;
}

export function buildProposalSummaryText(proposal: PlanProposal) {
  return `${PROPOSAL_FIELD_LABELS[proposal.field]} proposed: ${formatProposalValue(proposal.field, proposal.proposedValue)}`;
}

function getProposalTimelineFieldLabel(field: PlanProposal["field"]) {
  switch (field) {
    case "TITLE":
      return "the title";
    case "DESCRIPTION":
      return "the description";
    case "DATE_TIME":
      return "the date and time";
    case "LOCATION":
      return "the location";
    case "CATEGORY":
      return "the category";
    case "COST":
      return "the cost details";
  }
}

export function buildProposalClipboardText(
  proposal: PlanProposal,
  options: { eligibleVoterCount?: number } = {},
) {
  const fieldLabel = PROPOSAL_FIELD_LABELS[proposal.field];
  const approveCount = proposal.votes.filter(
    (vote) => vote.vote === "APPROVE",
  ).length;
  const rejectCount = proposal.votes.filter(
    (vote) => vote.vote === "REJECT",
  ).length;
  const totalVotes = approveCount + rejectCount;
  const eligibleVoterCount = Math.max(
    options.eligibleVoterCount ?? proposal.votes.length,
    proposal.votes.length,
    1,
  );

  return [
    `Plan change: ${fieldLabel}`,
    `${proposal.proposer.name} proposed this update on ${formatProposalDate(proposal.createdAt)}.`,
    `Current: ${formatProposalValue(proposal.field, proposal.currentValue)}`,
    `New: ${formatProposalValue(proposal.field, proposal.proposedValue)}`,
    `Status: ${PROPOSAL_STATUS_LABELS[proposal.status]}`,
    `Votes: ${totalVotes}/${eligibleVoterCount} (${approveCount} approve, ${rejectCount} reject)`,
  ].join("\n");
}
