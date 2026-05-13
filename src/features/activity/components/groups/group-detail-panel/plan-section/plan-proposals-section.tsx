import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { PlanProposal } from "@/shared/schemas/plan";
import { PlanProposalCard } from "./plan-proposals";
import { useFocusedPlanProposalScroll } from "./plan-proposals/use-focused-plan-proposal-scroll";

interface PlanProposalsSectionProps {
  groupId: string;
  isReadOnly?: boolean;
  proposals: PlanProposal[];
  focusedProposalId?: string | null;
}

export function PlanProposalsSection({
  groupId,
  isReadOnly = false,
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
  const activeProposalCount = proposals.filter(
    (proposal) => proposal.status === "PENDING",
  ).length;

  if (proposals.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-5 flex flex-col gap-3"
      aria-labelledby="plan-proposals-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="plan-proposals-title"
          className="font-bold text-muted-foreground/70 text-xs"
        >
          {isReadOnly ? "Plan change history" : "Plan changes"}
        </h3>
        <span className="font-semibold text-muted-foreground text-xs">
          {isReadOnly
            ? `${proposals.length} total`
            : activeProposalCount === 0
              ? "None active"
              : `${activeProposalCount} active`}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {proposals.map((proposal) => (
          <PlanProposalCard
            key={proposal.id}
            actions={proposalActions}
            canAct={!isReadOnly}
            currentUserId={currentUser?.id}
            isFocused={focusedProposalId === proposal.id}
            proposal={proposal}
            setProposalRef={setProposalRef}
          />
        ))}
      </div>
    </section>
  );
}
