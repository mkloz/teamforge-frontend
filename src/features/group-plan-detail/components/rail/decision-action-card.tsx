import { LogOut } from "lucide-react";
import { GroupPlanActionButton } from "@/features/group-plan-detail/components/group-plan-action-button";
import { RailCard } from "@/features/group-plan-detail/components/rail/rail-card";
import type { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getSeatsLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

interface DecisionActionCardProps {
  detail: GroupPlanDetail;
  action: GroupPlanActionState;
}

type GroupPlanActionState = ReturnType<typeof useGroupPlanActionState>;
type GroupPlanActionMode = GroupPlanActionState["mode"];
type SecondaryGroupPlanAction = NonNullable<GroupPlanActionState["secondary"]>;

interface DecisionActionCopy {
  headline: string;
  seats: string;
  summary: string;
}

export function DecisionActionCard({
  detail,
  action,
}: DecisionActionCardProps) {
  const copy = getDecisionActionCopy({ action, detail });

  return (
    <RailCard tone="highlight">
      <DecisionActionSummary copy={copy} />
      <DecisionActionControls
        primary={action.primary}
        secondary={action.secondary}
      />
    </RailCard>
  );
}

function DecisionActionSummary({ copy }: { copy: DecisionActionCopy }) {
  return (
    <>
      <p className="font-black text-foreground text-sm">{copy.headline}</p>
      <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
        {copy.summary}
      </p>
      <p className="mt-3 font-bold text-foreground text-xs uppercase tracking-widest">
        {copy.seats}
      </p>
    </>
  );
}

function DecisionActionControls({
  primary,
  secondary,
}: Pick<GroupPlanActionState, "primary" | "secondary">) {
  return (
    <div className="mt-4 grid gap-2">
      <GroupPlanActionButton action={primary} className="w-full" />
      {secondary ? <SecondaryDecisionAction action={secondary} /> : null}
    </div>
  );
}

function SecondaryDecisionAction({
  action,
}: {
  action: SecondaryGroupPlanAction;
}) {
  if (action.kind === "leave") {
    return <LeaveGroupConfirmationAction action={action} />;
  }

  return (
    <GroupPlanActionButton
      action={action}
      variant="outline"
      className="w-full"
    />
  );
}

function LeaveGroupConfirmationAction({
  action,
}: {
  action: SecondaryGroupPlanAction;
}) {
  return (
    <ActionDialog
      cancelLabel="Stay in group"
      confirmLabel="Leave group"
      description="You will lose access to the group chat and planning workspace."
      loading={action.loading}
      onConfirm={() => action.onClick?.()}
      title="Leave this group?"
      tone="danger"
      trigger={
        <Button variant="outline" className="w-full" disabled={action.loading}>
          <LogOut className="size-4" aria-hidden="true" />
          {action.label}
        </Button>
      }
    />
  );
}

function getDecisionActionCopy({
  action,
  detail,
}: {
  action: GroupPlanActionState;
  detail: GroupPlanDetail;
}): DecisionActionCopy {
  return {
    headline: getDecisionActionHeadline(action.mode),
    seats: getSeatsLabel(detail),
    summary: action.summary,
  };
}

const DECISION_ACTION_HEADLINES = {
  blocked: "Not joinable right now",
  invited: "You're invited",
  joinable: "Ready to join?",
  member: "You're in",
  requested: "Request pending",
} satisfies Record<GroupPlanActionMode, string>;

function getDecisionActionHeadline(mode: GroupPlanActionMode) {
  return DECISION_ACTION_HEADLINES[mode] ?? "Group access";
}
