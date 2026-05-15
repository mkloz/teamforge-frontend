import { GroupPlanActionButton } from "@/features/group-plan-detail/components/group-plan-action-button";
import { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getSeatsLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";

interface MobileActionDockProps {
  detail: GroupPlanDetail;
}

export function MobileActionDock({ detail }: MobileActionDockProps) {
  const action = useGroupPlanActionState(detail);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-border/70 border-t bg-canvas/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-8px_24px_rgb(0_0_0/6%)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-foreground text-sm">
            {action.isMember ? "You're in" : action.primary.label}
          </p>
          <p className="truncate font-medium text-muted-foreground text-xs">
            {action.isMember ? action.summary : getSeatsLabel(detail)}
          </p>
        </div>
        <GroupPlanActionButton
          action={action.primary}
          label={action.isMember ? "Open" : action.primary.label}
          size="md"
        />
      </div>
    </div>
  );
}
