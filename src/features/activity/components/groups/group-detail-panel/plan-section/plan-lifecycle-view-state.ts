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

type PlanLifecycleActionKey =
  | "cancel-plan"
  | "complete-plan"
  | "confirm-plan"
  | "create-next-plan";

interface PendingActionLabels {
  idle: string;
  loading: string;
}

const PENDING_ACTION_LABELS = {
  "cancel-plan": {
    idle: "Cancel plan",
    loading: "Cancelling...",
  },
  "complete-plan": {
    idle: "Complete",
    loading: "Completing...",
  },
  "confirm-plan": {
    idle: "Confirm plan",
    loading: "Confirming...",
  },
} satisfies Partial<Record<PlanLifecycleActionKey, PendingActionLabels>>;

const DRAFT_LIKE_PLAN_STATUSES = new Set<Plan["status"]>(["DRAFT", "PROPOSED"]);
const ACTIVE_PLAN_STATUSES = new Set<Plan["status"]>([
  "CONFIRMED",
  "IN_PROGRESS",
]);
const TERMINAL_PLAN_STATUSES = new Set<Plan["status"]>([
  "COMPLETED",
  "CANCELLED",
]);

interface PlanLifecycleStatusFlags {
  isActive: boolean;
  isDraftLike: boolean;
  isTerminal: boolean;
}

interface LabeledLifecycleActionStateOptions {
  action: keyof typeof PENDING_ACTION_LABELS;
  disabled: boolean;
  pendingAction: string | null;
  title?: string;
}

interface LifecycleActionStateOptions {
  action: PlanLifecycleActionKey;
  disabled: boolean;
  pendingAction: string | null;
  title?: string;
}

function isDraftLikePlan(plan: Plan) {
  return DRAFT_LIKE_PLAN_STATUSES.has(plan.status);
}

function isActivePlan(plan: Plan) {
  return ACTIVE_PLAN_STATUSES.has(plan.status);
}

function isTerminalPlan(plan: Plan) {
  return TERMINAL_PLAN_STATUSES.has(plan.status);
}

function isPendingAction(
  pendingAction: string | null,
  action: PlanLifecycleActionKey,
) {
  return pendingAction === action;
}

function getOfflineActionTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before changing this plan.";
}

function getPendingActionLabel(
  pendingAction: string | null,
  action: keyof typeof PENDING_ACTION_LABELS,
) {
  const labels = PENDING_ACTION_LABELS[action];

  return isPendingAction(pendingAction, action) ? labels.loading : labels.idle;
}

function getConfirmActionTitle(plan: Plan, offlineTitle?: string) {
  return (
    offlineTitle ??
    (!hasValidPlanDateTime(plan.dateTime)
      ? "Set a date before confirming"
      : undefined)
  );
}

function hasValidPlanDateTime(value: string | null) {
  return value !== null && !Number.isNaN(new Date(value).getTime());
}

function getPlanLifecycleStatusFlags(plan: Plan): PlanLifecycleStatusFlags {
  return {
    isActive: isActivePlan(plan),
    isDraftLike: isDraftLikePlan(plan),
    isTerminal: isTerminalPlan(plan),
  };
}

function getHasOfflineBlock(isOnline: boolean) {
  return !isOnline;
}

function getIsPlanActionDisabled(
  hasOfflineBlock: boolean,
  pendingAction: string | null,
) {
  return hasOfflineBlock || pendingAction !== null;
}

function canCurrentUserManagePlan(
  currentUserRole: MemberRole,
  isReadOnly: boolean,
) {
  return currentUserRole === "ADMIN" && !isReadOnly;
}

function getUnavailableActionDisabled(
  isPlanActionDisabled: boolean,
  hasAction: boolean,
) {
  return isPlanActionDisabled || !hasAction;
}

function getConfirmActionDisabled({
  hasConfirmPlan,
  isPlanActionDisabled,
  plan,
}: {
  hasConfirmPlan: boolean;
  isPlanActionDisabled: boolean;
  plan: Plan;
}) {
  return (
    !hasValidPlanDateTime(plan.dateTime) ||
    getUnavailableActionDisabled(isPlanActionDisabled, hasConfirmPlan)
  );
}

function getLabeledLifecycleActionState({
  action,
  disabled,
  pendingAction,
  title,
}: LabeledLifecycleActionStateOptions): PlanLifecycleActionState {
  return {
    confirmLabel: getPendingActionLabel(pendingAction, action),
    disabled,
    loading: isPendingAction(pendingAction, action),
    title,
  };
}

function getLifecycleActionState({
  action,
  disabled,
  pendingAction,
  title,
}: LifecycleActionStateOptions): PlanLifecycleActionState {
  return {
    disabled,
    loading: isPendingAction(pendingAction, action),
    title,
  };
}

function getStaticLifecycleActionState({
  disabled,
  title,
}: Pick<
  LifecycleActionStateOptions,
  "disabled" | "title"
>): PlanLifecycleActionState {
  return {
    disabled,
    loading: false,
    title,
  };
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
  const statusFlags = getPlanLifecycleStatusFlags(plan);
  const hasOfflineBlock = getHasOfflineBlock(isOnline);
  const isPlanActionDisabled = getIsPlanActionDisabled(
    hasOfflineBlock,
    pendingAction,
  );
  const offlineTitle = getOfflineActionTitle(isOnline);

  return {
    canManagePlan: canCurrentUserManagePlan(currentUserRole, isReadOnly),
    cancel: getLabeledLifecycleActionState({
      action: "cancel-plan",
      disabled: getUnavailableActionDisabled(
        isPlanActionDisabled,
        hasCancelPlan,
      ),
      pendingAction,
      title: offlineTitle,
    }),
    complete: getLabeledLifecycleActionState({
      action: "complete-plan",
      disabled: getUnavailableActionDisabled(
        isPlanActionDisabled,
        hasCompletePlan,
      ),
      pendingAction,
      title: offlineTitle,
    }),
    confirm: getLabeledLifecycleActionState({
      action: "confirm-plan",
      disabled: getConfirmActionDisabled({
        hasConfirmPlan,
        isPlanActionDisabled,
        plan,
      }),
      pendingAction,
      title: getConfirmActionTitle(plan, offlineTitle),
    }),
    createNext: getLifecycleActionState({
      action: "create-next-plan",
      disabled: isPlanActionDisabled,
      pendingAction,
      title: offlineTitle,
    }),
    edit: getStaticLifecycleActionState({
      disabled: getUnavailableActionDisabled(isPlanActionDisabled, hasEditPlan),
      title: offlineTitle,
    }),
    hasOfflineBlock,
    showCancelAction: !statusFlags.isTerminal,
    showCompleteAction: statusFlags.isActive,
    showConfirmAction: statusFlags.isDraftLike,
    showCreateNextAction: statusFlags.isTerminal,
  };
}
