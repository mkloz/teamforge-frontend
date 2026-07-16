import { CountdownCard } from "@/features/group-plan-detail/components/rail/countdown-card";
import { DecisionActionCard } from "@/features/group-plan-detail/components/rail/decision-action-card";
import { GroupOverviewCard } from "@/features/group-plan-detail/components/rail/group-overview-card";
import { MemberQuickActions } from "@/features/group-plan-detail/components/rail/member-quick-actions";
import { PendingVotesCard } from "@/features/group-plan-detail/components/rail/pending-votes-card";
import { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface DecisionRailProps {
  detail: GroupPlanDetail;
}

export function DecisionRail({ detail }: DecisionRailProps) {
  const action = useGroupPlanActionState(detail);

  return (
    <aside
      aria-label="Group decision panel"
      className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--group-detail-cover-collapsed-height,72px)+1.5rem)]"
    >
      <DecisionActionCard detail={detail} action={action} />

      {action.isMember ? (
        <>
          <PendingVotesCard detail={detail} />
          <CountdownCard detail={detail} />
          <MemberQuickActions detail={detail} />
        </>
      ) : (
        <>
          <CountdownCard detail={detail} />
          <GroupOverviewCard detail={detail} />
        </>
      )}
    </aside>
  );
}
