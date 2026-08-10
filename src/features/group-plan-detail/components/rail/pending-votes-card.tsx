import { Link } from "@tanstack/react-router";
import { CircleDashed } from "lucide-react";
import { PendingPlanProposalRow } from "@/features/group-plan-detail/components/rail/pending-plan-proposal-row";
import { RailCard } from "@/features/group-plan-detail/components/rail/rail-card";
import { getPendingVoteHeadline } from "@/features/group-plan-detail/components/rail/rail-model";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import { buildActivityGroupNavigation } from "@/shared/navigation/activity-navigation";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";

interface PendingVotesCardProps {
  detail: GroupPlanDetail;
}

export function PendingVotesCard({ detail }: PendingVotesCardProps) {
  const pending = detail.planning.pendingProposalCount;
  const currentUserQuery = useCurrentUserQuery();
  const proposalActions = useGroupPlanProposalActions({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });
  const governance = detail.governance;
  const canVote = isSystemManagedGroupGovernance(governance)
    ? detail.viewer.canVoteOnPlanChange &&
      governance.capabilities.canVoteOnPlanChange
    : governance !== undefined && detail.viewer.canVoteOnPlanChange;

  const planningProposals = detail.planning.proposals.filter(
    (proposal) =>
      proposal.status === "PENDING" &&
      (proposal.field === "DATE_TIME" || proposal.field === "LOCATION"),
  );
  planningProposals.sort(comparePlanningProposalPriority);

  if (
    pending === 0 ||
    detail.planning.visibility === "HIDDEN" ||
    planningProposals.length === 0
  ) {
    return null;
  }

  return (
    <RailCard tone="highlight">
      <div className="flex items-center gap-3">
        <CircleDashed
          className="size-4 shrink-0 text-brand-amber"
          aria-hidden="true"
        />
        <p className="min-w-0 font-bold text-foreground text-sm leading-snug">
          {getPendingVoteHeadline(planningProposals.length)}
        </p>
      </div>

      <p className="mt-2 font-medium text-muted-foreground text-xs leading-relaxed">
        Compare the options. Each one needs its own group approval.
      </p>

      <ul className="mt-3 flex flex-col gap-3">
        {planningProposals.map((proposal) => (
          <PendingPlanProposalRow
            key={proposal.id}
            canVote={canVote}
            currentUserId={currentUserQuery.data?.id}
            isOnline={proposalActions.isOnline}
            isSubmitting={proposalActions.isSubmitting}
            onApprove={() => proposalActions.approveProposal(proposal.id)}
            onReject={() => proposalActions.rejectProposal(proposal.id)}
            proposal={proposal}
          />
        ))}
      </ul>

      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
        <Link
          {...buildActivityGroupNavigation(detail.group.id, {
            panel: "group",
          })}
        >
          Open group chat
        </Link>
      </Button>
    </RailCard>
  );
}

function comparePlanningProposalPriority(
  left: GroupPlanDetail["planning"]["proposals"][number],
  right: GroupPlanDetail["planning"]["proposals"][number],
) {
  if (left.field === right.field) {
    return left.createdAt.localeCompare(right.createdAt);
  }

  return left.field === "DATE_TIME" ? -1 : 1;
}
