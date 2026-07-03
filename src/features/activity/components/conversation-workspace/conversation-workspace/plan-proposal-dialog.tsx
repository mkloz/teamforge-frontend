import { canShowPlanProposalDialog } from "@/features/activity/components/conversation-workspace/conversation-workspace/plan-proposal-dialog-state";
import { PlanChangeDialog } from "@/features/activity/components/groups/group-detail-panel/plan-section/plan-change-dialog";
import type { Plan } from "@/features/activity/lib/activity-contract";

export function ConversationPlanProposalDialog({
  activePlan,
  isCompleted,
  isOpen,
  onOpenChange,
}: {
  activePlan?: Plan | null;
  isCompleted: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!canShowPlanProposalDialog(activePlan, isCompleted)) {
    return null;
  }

  return (
    <PlanChangeDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      plan={activePlan}
      trigger={null}
    />
  );
}
