import { Check, X } from "lucide-react";
import { formatPlanDateTime } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { Button } from "@/shared/components/ui/button";
import {
  formatPlanLocationValue,
  parsePlanLocationValue,
} from "@/shared/lib/plan-proposal-values";
import { cn } from "@/shared/lib/utils";
import type { PlanProposal } from "@/shared/schemas";

interface PendingPlanProposalRowProps {
  canVote: boolean;
  currentUserId?: string;
  isOnline: boolean;
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  proposal: PlanProposal;
}

export function PendingPlanProposalRow({
  canVote,
  currentUserId,
  isOnline,
  isSubmitting,
  onApprove,
  onReject,
  proposal,
}: PendingPlanProposalRowProps) {
  const approvalCount = proposal.activeApprovalCount;
  const currentVote = proposal.votes.find(
    (vote) => vote.userId === currentUserId,
  )?.vote;
  const canSubmitVote =
    canVote && Boolean(currentUserId) && currentVote === undefined;

  return (
    <li className="border-border/60 border-t pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-foreground text-xs">
            {proposal.field === "DATE_TIME" ? "Time option" : "Place option"}
          </p>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {formatPlanningProposalValue(proposal)}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            Proposed by {proposal.proposer.name}
          </p>
        </div>
        <span
          className="shrink-0 font-bold text-foreground text-xs"
          title={`${proposal.eligibleVoterCount} members can vote`}
        >
          {approvalCount}/{proposal.approvalThreshold} approvals
        </span>
      </div>

      <ApprovalSteps
        approvalCount={approvalCount}
        approvalThreshold={proposal.approvalThreshold}
      />

      {canSubmitVote ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              disabled={!isOnline || isSubmitting}
              onClick={onApprove}
              title={isOnline ? undefined : "Reconnect before voting."}
            >
              <Check className="size-3.5" aria-hidden="true" />
              Choose this
            </Button>
            <Button
              type="button"
              variant="subtle"
              size="xs"
              disabled={!isOnline || isSubmitting}
              onClick={onReject}
              title={isOnline ? undefined : "Reconnect before voting."}
            >
              <X className="size-3.5" aria-hidden="true" />
              Not this one
            </Button>
          </div>
          {!isOnline ? (
            <p className="mt-2 text-muted-foreground text-xs">
              Reconnect to vote.
            </p>
          ) : null}
        </>
      ) : currentVote ? (
        <p className="mt-2 text-muted-foreground text-xs">
          {currentVote === "APPROVE"
            ? "You chose this option."
            : "You passed on this option."}
        </p>
      ) : currentUserId ? (
        <p className="mt-2 text-muted-foreground text-xs">
          Voting is not available for this account.
        </p>
      ) : null}
    </li>
  );
}

function ApprovalSteps({
  approvalCount,
  approvalThreshold,
}: {
  approvalCount: number;
  approvalThreshold: number;
}) {
  return (
    <div
      className="mt-2 flex items-center gap-1"
      role="progressbar"
      aria-label={`${approvalCount} of ${approvalThreshold} approvals`}
      aria-valuemin={0}
      aria-valuemax={approvalThreshold}
      aria-valuenow={Math.min(approvalCount, approvalThreshold)}
    >
      {getApprovalSteps(approvalThreshold).map((step) => (
        <span
          key={step.id}
          className={cn(
            "h-1.5 min-w-3 flex-1 rounded-full bg-border",
            step.position <= approvalCount && "bg-brand-teal",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function getApprovalSteps(approvalThreshold: number) {
  return Array.from({ length: approvalThreshold }, (_, index) => ({
    id: `approval-step-${index + 1}`,
    position: index + 1,
  }));
}

function formatPlanningProposalValue(proposal: PlanProposal) {
  if (proposal.field === "DATE_TIME") {
    return formatPlanDateTime(proposal.proposedValue).full;
  }

  const location = parsePlanLocationValue(proposal.proposedValue);

  return location
    ? formatPlanLocationValue(location)
    : proposal.proposedValue.trim();
}
