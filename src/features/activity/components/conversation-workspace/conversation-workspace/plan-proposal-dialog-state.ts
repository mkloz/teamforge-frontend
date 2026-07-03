import type { ConversationWorkspaceProps } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";
import type { Plan } from "@/features/activity/lib/activity-contract";

export function canOpenPlanProposalDialog(
  kind: ConversationWorkspaceProps["kind"],
  activePlan: Plan | null | undefined,
  isCompleted: boolean,
) {
  return kind === "group" && canShowPlanProposalDialog(activePlan, isCompleted);
}

export function createOpenProposalDialogHandler(
  setIsProposalDialogOpen: (isOpen: boolean) => void,
) {
  return () => setIsProposalDialogOpen(true);
}

export function canShowPlanProposalDialog(
  activePlan: Plan | null | undefined,
  isCompleted: boolean,
): activePlan is Plan {
  return Boolean(activePlan && !isCompleted);
}
