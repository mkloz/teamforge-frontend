import { Link } from "@tanstack/react-router";
import { CircleDashed } from "lucide-react";
import { RailCard } from "@/features/group-plan-detail/components/rail/rail-card";
import { getPendingVoteHeadline } from "@/features/group-plan-detail/components/rail/rail-model";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { buildActivityGroupNavigation } from "@/shared/navigation/activity-navigation";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";

interface PendingVotesCardProps {
  detail: GroupPlanDetail;
}

export function PendingVotesCard({ detail }: PendingVotesCardProps) {
  const pending = detail.planning.pendingProposalCount;
  const governance = detail.governance;
  const canVote = isSystemManagedGroupGovernance(governance)
    ? detail.viewer.canVoteOnPlanChange &&
      governance.capabilities.canVoteOnPlanChange
    : governance !== undefined && detail.viewer.canVoteOnPlanChange;

  if (pending === 0 || !canVote) return null;

  return (
    <RailCard tone="highlight">
      <div className="flex items-center gap-3">
        <CircleDashed
          className="size-4 shrink-0 text-spark-amber"
          aria-hidden="true"
        />
        <p className="min-w-0 font-bold text-foreground text-sm leading-snug">
          {getPendingVoteHeadline(pending)}
        </p>
      </div>

      <p className="mt-2 font-medium text-muted-foreground text-xs leading-relaxed">
        Review and vote on the plan changes waiting for your decision.
      </p>

      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
        <Link
          {...buildActivityGroupNavigation(detail.group.id, {
            panel: "group",
          })}
        >
          Open workspace
        </Link>
      </Button>
    </RailCard>
  );
}
