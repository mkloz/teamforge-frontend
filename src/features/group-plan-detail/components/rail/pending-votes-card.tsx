import { MessageSquareWarning } from "lucide-react";
import { RailCard } from "@/features/group-plan-detail/components/rail/rail-card";
import { getPendingVoteHeadline } from "@/features/group-plan-detail/components/rail/rail-model";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";

interface PendingVotesCardProps {
  detail: GroupPlanDetail;
}

export function PendingVotesCard({ detail }: PendingVotesCardProps) {
  const pending = detail.planning.pendingProposalCount;
  if (pending === 0 || !detail.viewer.canVoteOnPlanChange) return null;

  return (
    <RailCard tone="highlight">
      <div className="flex items-start gap-3">
        <MessageSquareWarning
          className="mt-0.5 size-4 shrink-0 text-spark-amber"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-black text-foreground text-sm">
            {getPendingVoteHeadline(pending)}
          </p>
          <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
            Approve, reject, or weigh in on what the group is shaping.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <a href="#activity">Review changes</a>
          </Button>
        </div>
      </div>
    </RailCard>
  );
}
