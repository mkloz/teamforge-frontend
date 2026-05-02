import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { PlanProposalCard } from "./plan-proposals";
import { useFocusedPlanProposalScroll } from "./plan-proposals/use-focused-plan-proposal-scroll";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { PlanProposal } from "@/shared/schemas/plan";

interface PlanProposalsSectionProps {
  groupId: string;
  proposals: PlanProposal[];
  focusedProposalId?: string | null;
}

export function PlanProposalsSection({
  groupId,
  proposals,
  focusedProposalId = null,
}: PlanProposalsSectionProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const setProposalRef = useFocusedPlanProposalScroll(
    focusedProposalId,
    proposals,
  );
  const proposalActions = usePlanProposalActions({
    groupId,
    mutationKeyScope: `group-${groupId}`,
  });

  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3" aria-labelledby="plan-proposals-title">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="plan-proposals-title"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
        >
          Plan Proposals
        </h3>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {proposals.length} active
        </span>
      </div>

      <div className="space-y-2.5">
        {proposals.map((proposal) => (
          <PlanProposalCard
            key={proposal.id}
            actions={proposalActions}
            currentUserId={currentUser?.id}
            isFocused={focusedProposalId === proposal.id}
            proposal={proposal}
            setProposalRef={setProposalRef}
          />
        ))}
      </div>
    </div>
  );
}
