import { Lightbulb } from "lucide-react";
import type { Ref } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { PlanChangeDialog } from "@/features/group-plan-detail/components/plan-change-dialog";
import { Section } from "@/features/group-plan-detail/components/section";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { IcebreakerPrompt } from "./icebreaker-prompt";
import { ProposalRow } from "./proposal-row";

interface ActivitySectionProps {
  detail: GroupPlanDetail;
  highlightedProposalId?: string | null;
  isHighlighted?: boolean;
  sectionRef?: Ref<HTMLElement>;
}

export function ActivitySection({
  detail,
  highlightedProposalId = null,
  isHighlighted = false,
  sectionRef,
}: ActivitySectionProps) {
  const hasProposals = detail.planning.proposals.length > 0;
  const actions = useGroupPlanProposalActions({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });
  const canSuggestChange = Boolean(
    detail.viewer.canSuggestPlanChange && detail.plan,
  );
  const visibleProposals = detail.planning.proposals.slice(0, 3);
  const hasHiddenMemberProposals =
    !hasProposals &&
    detail.planning.pendingProposalCount > 0 &&
    detail.planning.visibility === "PUBLIC_SUMMARY";

  return (
    <Section
      heading={hasProposals ? "Plan changes in flight" : "Plan activity"}
      description={
        hasProposals
          ? "Members are weighing changes to the plan. Approve, reject, or suggest your own."
          : "When members suggest a clear change, it'll show up here for the group to weigh."
      }
      headingId="activity-section-heading"
      sectionRef={sectionRef}
      isHighlighted={isHighlighted}
      trailing={
        <ActivitySectionActions
          canSuggestChange={canSuggestChange}
          detail={detail}
          isCreating={actions.isCreating}
          isSubmitting={actions.isSubmitting}
          pendingProposalCount={detail.planning.pendingProposalCount}
          onCreate={actions.createProposal}
        />
      }
    >
      {hasProposals ? (
        <div className="grid gap-3">
          {visibleProposals.map((proposal) => (
            <ProposalRow
              actions={actions}
              canVote={detail.viewer.canVoteOnPlanChange}
              currentUserId={detail.viewer.userId}
              isHighlighted={proposal.id === highlightedProposalId}
              key={proposal.id}
              proposal={proposal}
            />
          ))}
          {detail.planning.pendingProposalCount > visibleProposals.length ? (
            <p className="font-medium text-muted-foreground text-sm">
              Showing the latest {visibleProposals.length} of{" "}
              {detail.planning.pendingProposalCount} open changes.
            </p>
          ) : null}
        </div>
      ) : (
        <ActivityEmptyState
          canSuggestChange={canSuggestChange}
          detail={detail}
          hasHiddenMemberProposals={hasHiddenMemberProposals}
        />
      )}
    </Section>
  );
}

function ActivitySectionActions({
  canSuggestChange,
  detail,
  isCreating,
  isSubmitting,
  onCreate,
  pendingProposalCount,
}: {
  canSuggestChange: boolean;
  detail: GroupPlanDetail;
  isCreating: boolean;
  isSubmitting: boolean;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
  pendingProposalCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {pendingProposalCount > 0 ? (
        <p className="font-bold text-sm text-spark-amber">
          {pendingProposalCount} pending
        </p>
      ) : null}
      {canSuggestChange ? (
        <PlanChangeDialog
          detail={detail}
          disabled={isSubmitting}
          isCreating={isCreating}
          onCreate={onCreate}
        />
      ) : null}
    </div>
  );
}

function ActivityEmptyState({
  canSuggestChange,
  detail,
  hasHiddenMemberProposals,
}: {
  canSuggestChange: boolean;
  detail: GroupPlanDetail;
  hasHiddenMemberProposals: boolean;
}) {
  return (
    <div className="grid gap-10">
      <IcebreakerPrompt detail={detail} />

      <div className="flex items-start gap-4 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-spark-amber/10 text-spark-amber">
          <Lightbulb className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-black text-foreground text-sm">
            {hasHiddenMemberProposals
              ? "Plan changes are member-only"
              : "Nothing pending"}
          </p>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {getEmptyCopy({
              canSuggestChange,
              hasHiddenMemberProposals,
              hasPlan: Boolean(detail.plan),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function getEmptyCopy({
  canSuggestChange,
  hasHiddenMemberProposals,
  hasPlan,
}: {
  canSuggestChange: boolean;
  hasHiddenMemberProposals: boolean;
  hasPlan: boolean;
}) {
  if (hasHiddenMemberProposals) {
    return "Members are reviewing the open changes inside the group workspace.";
  }
  if (!hasPlan) {
    return "Once the first plan is in place, members can suggest clear changes to time, place, cost, or details.";
  }
  if (canSuggestChange) {
    return "The plan is quiet right now. Suggest one clear change when the group needs to adjust time, place, cost, or details.";
  }
  return "The plan is quiet right now. Members can suggest changes when the group needs to adjust.";
}
