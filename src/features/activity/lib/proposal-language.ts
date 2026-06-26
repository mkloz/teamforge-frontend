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
  CANCELLED: "Cancelled",
};

const PROPOSAL_TIMELINE_FIELD_LABELS: Record<PlanProposal["field"], string> = {
  CATEGORY: "the category",
  COST: "the cost details",
  DATE_TIME: "the date and time",
  DESCRIPTION: "the description",
  LOCATION: "the location",
  TITLE: "the title",
};

type ProposalValueFormatter = (value: string) => string;

const PROPOSAL_VALUE_FORMATTERS: Partial<
  Record<PlanProposal["field"], ProposalValueFormatter>
> = {
  COST: formatCostProposalValue,
  LOCATION: formatPlanLocationProposalValue,
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

  const fieldFormatter = PROPOSAL_VALUE_FORMATTERS[field];

  return fieldFormatter
    ? fieldFormatter(value)
    : formatTextProposalValue(value);
}

function formatTextProposalValue(value: string) {
  const date = new Date(value);

  if (!Number.isNaN(date.getTime()) && value.includes("T")) {
    return formatProposalDateTime(date);
  }

  return value;
}

function formatProposalDateTime(date: Date) {
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
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
    return formatFreeCostProposalValue(details);
  }

  return formatPaidCostProposalValue(parsedValue);
}

function formatFreeCostProposalValue(details: string | null) {
  return details ? `Free \u00b7 ${details}` : "Free";
}

function formatPaidCostProposalValue({
  costAmount,
  costDetails,
}: CostProposalValue) {
  const amount =
    costAmount === null ? null : `About \u00a3${formatCostAmount(costAmount)}`;

  return joinCostParts(amount, costDetails) ?? "Paid";
}

function joinCostParts(
  amount: string | null,
  details: string | null,
): string | null {
  return [amount, details].filter(Boolean).join(" \u00b7 ") || null;
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

function getProposalTimelineFieldLabel(field: PlanProposal["field"]) {
  return PROPOSAL_TIMELINE_FIELD_LABELS[field];
}

export function buildProposalClipboardText(
  proposal: PlanProposal,
  options: { eligibleVoterCount?: number } = {},
) {
  const fieldLabel = PROPOSAL_FIELD_LABELS[proposal.field];
  const voteSummary = getProposalVoteSummary(proposal, options);

  return [
    `Plan change: ${fieldLabel}`,
    `${proposal.proposer.name} proposed this update on ${formatProposalDate(proposal.createdAt)}.`,
    `Current: ${formatProposalValue(proposal.field, proposal.currentValue)}`,
    `New: ${formatProposalValue(proposal.field, proposal.proposedValue)}`,
    `Status: ${PROPOSAL_STATUS_LABELS[proposal.status]}`,
    `Votes: ${voteSummary.totalVotes}/${voteSummary.eligibleVoterCount} (${voteSummary.approveCount} approve, ${voteSummary.rejectCount} reject)`,
  ].join("\n");
}

function getProposalVoteSummary(
  proposal: PlanProposal,
  options: { eligibleVoterCount?: number },
) {
  const approveCount = countProposalVotes(proposal, "APPROVE");
  const rejectCount = countProposalVotes(proposal, "REJECT");

  return {
    approveCount,
    eligibleVoterCount: Math.max(
      options.eligibleVoterCount ?? proposal.votes.length,
      proposal.votes.length,
      1,
    ),
    rejectCount,
    totalVotes: approveCount + rejectCount,
  };
}

function countProposalVotes(
  proposal: PlanProposal,
  voteType: PlanProposal["votes"][number]["vote"],
) {
  return proposal.votes.filter((vote) => vote.vote === voteType).length;
}
