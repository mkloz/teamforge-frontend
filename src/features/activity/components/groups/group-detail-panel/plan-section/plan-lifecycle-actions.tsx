import { CheckCircle2, Pencil, PlusCircle, XCircle } from "lucide-react";
import { useState } from "react";
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
  onCreateNextPlan?: (options?: RepeatPlanOptions) => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction: string | null;
  plan: Plan;
  repeatCandidates?: RepeatCandidate[];
}

export interface RepeatPlanOptions {
  repeatInviteeIds?: string[];
  repeatMode: "SAME_GROUP" | "SELECT_PEOPLE" | "SAME_ACTIVITY";
}

export interface RepeatCandidate {
  name: string;
  userId: string;
}

const NO_REPEAT_CANDIDATES: RepeatCandidate[] = [];

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
  repeatCandidates = NO_REPEAT_CANDIDATES,
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
        isCompleted={plan.status === "COMPLETED"}
        onCreateNextPlan={onCreateNextPlan}
        repeatExperimentVariant={plan.repeatExperimentVariant}
        repeatCandidates={repeatCandidates}
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
  isCompleted,
  onCreateNextPlan,
  repeatExperimentVariant,
  repeatCandidates,
  viewState,
}: {
  isCompleted: boolean;
  onCreateNextPlan?: (options?: RepeatPlanOptions) => Promise<void> | void;
  repeatExperimentVariant: Plan["repeatExperimentVariant"];
  repeatCandidates: RepeatCandidate[];
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.createNext;

  if (!viewState.showCreateNextAction) {
    return null;
  }

  if (isCompleted && repeatExperimentVariant === "DO_THIS_AGAIN") {
    return (
      <RepeatPlanAction
        action={action}
        onCreateNextPlan={onCreateNextPlan}
        repeatCandidates={repeatCandidates}
      />
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      loading={action.loading}
      onClick={() => onCreateNextPlan?.()}
      title={action.title}
    >
      <PlusCircle className="size-3.5 shrink-0" />
      Plan another
    </Button>
  );
}

function RepeatPlanAction({
  action,
  onCreateNextPlan,
  repeatCandidates,
}: {
  action: PlanLifecycleViewState["createNext"];
  onCreateNextPlan?: (options?: RepeatPlanOptions) => Promise<void> | void;
  repeatCandidates: RepeatCandidate[];
}) {
  const [mode, setMode] =
    useState<RepeatPlanOptions["repeatMode"]>("SAME_GROUP");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRequired = mode === "SELECT_PEOPLE";

  return (
    <ActionDialog
      title="Do this again"
      description="Start a fresh plan without copying the old date, venue, chat, attendance, or private requests. Invitations are sent individually."
      confirmLabel="Create fresh plan"
      disabled={action.disabled || (selectionRequired && !selectedIds.length)}
      loading={action.loading}
      onConfirm={() =>
        onCreateNextPlan?.({
          repeatMode: mode,
          repeatInviteeIds: selectionRequired ? selectedIds : undefined,
        })
      }
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
          <PlusCircle className="size-3.5 shrink-0" />
          Do this again
        </Button>
      }
    >
      <div className="space-y-2">
        {REPEAT_MODE_OPTIONS.map((option) => (
          <label
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3"
            key={option.value}
          >
            <input
              aria-label={option.label}
              checked={mode === option.value}
              className="mt-1 accent-brand-teal"
              name="repeat-mode"
              onChange={() => setMode(option.value)}
              type="radio"
              value={option.value}
            />
            <span>
              <span className="block font-bold text-sm">{option.label}</span>
              <span className="block text-muted-foreground text-xs">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {selectionRequired ? (
        <div className="mt-3 space-y-2 rounded-xl bg-muted/40 p-3">
          <p className="font-bold text-xs">Choose people</p>
          {repeatCandidates.length ? (
            repeatCandidates.map((candidate) => (
              <label
                className="flex items-center gap-2 text-sm"
                key={candidate.userId}
              >
                <input
                  checked={selectedIds.includes(candidate.userId)}
                  className="accent-brand-teal"
                  onChange={() =>
                    setSelectedIds((current) =>
                      current.includes(candidate.userId)
                        ? current.filter((id) => id !== candidate.userId)
                        : [...current, candidate.userId],
                    )
                  }
                  type="checkbox"
                />
                {candidate.name}
              </label>
            ))
          ) : (
            <p className="text-muted-foreground text-xs">
              No eligible people are available.
            </p>
          )}
        </div>
      ) : null}
    </ActionDialog>
  );
}

const REPEAT_MODE_OPTIONS: Array<{
  description: string;
  label: string;
  value: RepeatPlanOptions["repeatMode"];
}> = [
  {
    value: "SAME_GROUP",
    label: "Same group",
    description: "Privately invite everyone still eligible in this group.",
  },
  {
    value: "SELECT_PEOPLE",
    label: "Select people",
    description: "Choose individual people from the completed plan group.",
  },
  {
    value: "SAME_ACTIVITY",
    label: "Same activity",
    description:
      "Reuse the activity as a fresh draft without reconnecting people.",
  },
];

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
