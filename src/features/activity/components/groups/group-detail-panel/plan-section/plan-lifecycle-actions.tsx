import { CheckCircle2, Pencil, PlusCircle, XCircle } from "lucide-react";
import type {
  MemberRole,
  Plan,
} from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { formatDate } from "../lib/constants";
import {
  getPlanLifecycleViewState,
  type PlanLifecycleViewState,
} from "./plan-lifecycle-view-state";

interface PlanLifecycleActionsProps {
  canManagePlanDirectly?: boolean;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: () => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction: string | null;
  plan: Plan;
}

export function PlanLifecycleActions({
  canManagePlanDirectly,
  currentUserRole,
  isReadOnly,
  isOnline,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction,
  plan,
}: PlanLifecycleActionsProps) {
  const viewState = getPlanLifecycleViewState({
    currentUserRole,
    canManagePlanDirectly,
    hasCancelPlan: Boolean(onCancelPlan),
    hasCompletePlan: Boolean(onCompletePlan),
    hasConfirmPlan: Boolean(onConfirmPlan),
    hasCreateNextPlan: Boolean(onCreateNextPlan),
    hasEditPlan: Boolean(onEditPlan),
    isOnline,
    isReadOnly,
    pendingAction,
    plan,
  });

  if (!viewState.canManagePlan) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <PlanLifecycleOfflineNotice visible={viewState.hasOfflineBlock} />

      <ConfirmPlanAction
        onConfirmPlan={onConfirmPlan}
        plan={plan}
        viewState={viewState}
      />

      <CompletePlanAction
        onCompletePlan={onCompletePlan}
        viewState={viewState}
      />

      <CancelPlanAction onCancelPlan={onCancelPlan} viewState={viewState} />

      <CreateNextPlanAction
        onCreateNextPlan={onCreateNextPlan}
        viewState={viewState}
      />

      <EditPlanAction onEditPlan={onEditPlan} viewState={viewState} />
    </div>
  );
}

function PlanLifecycleOfflineNotice({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <OfflineNotice
      withIcon={false}
      tone="neutral"
      size="xs"
      className="basis-full rounded-lg border-border/70 bg-muted/30 text-slate-muted"
    >
      Reconnect before changing this plan.
    </OfflineNotice>
  );
}

function ConfirmPlanAction({
  onConfirmPlan,
  plan,
  viewState,
}: {
  onConfirmPlan?: () => Promise<void> | void;
  plan: Plan;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.confirm;

  if (!viewState.showConfirmAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Review first"
      confirmLabel={action.confirmLabel}
      description="This confirms the draft as the group's current plan."
      details={[
        plan.dateTime ? `Time: ${formatDate(plan.dateTime)}` : "Date TBD",
        `Place: ${formatPlanLocation(plan)}`,
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onConfirmPlan}
      title="Confirm this plan?"
      tone="info"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Confirm plan
        </Button>
      }
    />
  );
}

function CompletePlanAction({
  onCompletePlan,
  viewState,
}: {
  onCompletePlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.complete;

  if (!viewState.showCompleteAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Not yet"
      confirmLabel={action.confirmLabel}
      description="Mark this plan as finished when the group has wrapped it up."
      details={[
        "The plan moves into completed history.",
        "Members can still use the group for follow-up and future plans.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCompletePlan}
      title="Complete this plan?"
      tone="success"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Complete
        </Button>
      }
    />
  );
}

function CancelPlanAction({
  onCancelPlan,
  viewState,
}: {
  onCancelPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.cancel;

  if (!viewState.showCancelAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Keep plan"
      confirmLabel={action.confirmLabel}
      description="This closes the current plan for the group."
      details={[
        "Members will see the plan as cancelled.",
        "The group chat stays open for deciding what happens next.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCancelPlan}
      title="Cancel this plan?"
      tone="danger"
      trigger={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <XCircle className="size-3.5 shrink-0" />
          Cancel
        </Button>
      }
    />
  );
}

function CreateNextPlanAction({
  onCreateNextPlan,
  viewState,
}: {
  onCreateNextPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.createNext;

  if (!viewState.showCreateNextAction) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      loading={action.loading}
      onClick={onCreateNextPlan}
      title={action.title}
    >
      <PlusCircle className="size-3.5 shrink-0" />
      Plan another
    </Button>
  );
}

function EditPlanAction({
  onEditPlan,
  viewState,
}: {
  onEditPlan?: () => void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.edit;

  if (!viewState.showEditAction) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      onClick={onEditPlan}
      title={action.title}
    >
      <Pencil className="size-3.5 shrink-0" />
      Edit plan
    </Button>
  );
}
