import type {
  MemberRole,
  Plan,
} from "@/features/activity/lib/activity-contract";

interface PlanLifecycleActionState {
  confirmLabel?: string;
  disabled: boolean;
  loading: boolean;
  title?: string;
}

export interface PlanLifecycleViewState {
  canManagePlan: boolean;
  cancel: PlanLifecycleActionState;
  complete: PlanLifecycleActionState;
  confirm: PlanLifecycleActionState;
  createNext: PlanLifecycleActionState;
  edit: PlanLifecycleActionState;
  hasOfflineBlock: boolean;
  showCancelAction: boolean;
  showCompleteAction: boolean;
  showConfirmAction: boolean;
  showCreateNextAction: boolean;
}

interface GetPlanLifecycleViewStateParams {
  currentUserRole: MemberRole;
  hasCancelPlan: boolean;
  hasCompletePlan: boolean;
  hasConfirmPlan: boolean;
  hasEditPlan: boolean;
  isOnline: boolean;
  isReadOnly: boolean;
  pendingAction: string | null;
  plan: Plan;
}

export function getPlanLifecycleViewState({
  currentUserRole,
  hasCancelPlan,
  hasCompletePlan,
  hasConfirmPlan,
  hasEditPlan,
  isOnline,
  isReadOnly,
  pendingAction,
  plan,
}: GetPlanLifecycleViewStateParams): PlanLifecycleViewState {
  const isDraftLike = plan.status === "DRAFT" || plan.status === "PROPOSED";
  const isActive = plan.status === "CONFIRMED" || plan.status === "IN_PROGRESS";
  const isTerminal = plan.status === "COMPLETED" || plan.status === "CANCELLED";
  const hasOfflineBlock = !isOnline;
  const isPlanActionDisabled = hasOfflineBlock || pendingAction !== null;
  const offlineTitle = isOnline
    ? undefined
    : "Reconnect before changing this plan.";

  return {
    canManagePlan: currentUserRole === "ADMIN" && !isReadOnly,
    cancel: {
      confirmLabel:
        pendingAction === "cancel-plan" ? "Cancelling..." : "Cancel plan",
      disabled: isPlanActionDisabled || !hasCancelPlan,
      loading: pendingAction === "cancel-plan",
      title: offlineTitle,
    },
    complete: {
      confirmLabel:
        pendingAction === "complete-plan" ? "Completing..." : "Complete",
      disabled: isPlanActionDisabled || !hasCompletePlan,
      loading: pendingAction === "complete-plan",
      title: offlineTitle,
    },
    confirm: {
      confirmLabel:
        pendingAction === "confirm-plan" ? "Confirming..." : "Confirm plan",
      disabled: !plan.dateTime || isPlanActionDisabled || !hasConfirmPlan,
      loading: pendingAction === "confirm-plan",
      title:
        offlineTitle ??
        (!plan.dateTime ? "Set a date before confirming" : undefined),
    },
    createNext: {
      disabled: isPlanActionDisabled,
      loading: pendingAction === "create-next-plan",
      title: offlineTitle,
    },
    edit: {
      disabled: isPlanActionDisabled || !hasEditPlan,
      loading: false,
      title: offlineTitle,
    },
    hasOfflineBlock,
    showCancelAction: !isTerminal,
    showCompleteAction: isActive,
    showConfirmAction: isDraftLike,
    showCreateNextAction: isTerminal,
  };
}
