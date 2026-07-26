import { LogOut } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { GroupPlanActionButton } from "@/features/group-plan-detail/components/group-plan-action-button";
import { RailCard } from "@/features/group-plan-detail/components/rail/rail-card";
import type { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import { Button } from "@/shared/components/ui/button";

interface DecisionActionCardProps {
  action: GroupPlanActionState;
}

type GroupPlanActionState = ReturnType<typeof useGroupPlanActionState>;
type GroupPlanActionMode = GroupPlanActionState["mode"];
type SecondaryGroupPlanAction = NonNullable<GroupPlanActionState["secondary"]>;

const ActionDialog = lazy(() =>
  import("@/shared/components/ui/action-dialog").then((module) => ({
    default: module.ActionDialog,
  })),
);

interface DecisionActionCopy {
  headline: string;
  summary: string | null;
}

export function DecisionActionCard({ action }: DecisionActionCardProps) {
  const copy = getDecisionActionCopy(action);

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
      <p className="font-bold text-foreground text-sm">{copy.headline}</p>
      {copy.summary ? (
        <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
          {copy.summary}
        </p>
      ) : null}
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = (
    <Button
      variant="outline"
      className="w-full"
      disabled={action.disabled || action.loading}
      title={action.title}
      onClick={() => {
        setIsLoaded(true);
        setIsOpen(true);
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {action.label}
    </Button>
  );

  if (!isLoaded) {
    return trigger;
  }

  return (
    <Suspense fallback={trigger}>
      <ActionDialog
        cancelLabel="Stay in group"
        confirmLabel="Leave group"
        description="You will lose access to the group chat and planning workspace."
        loading={action.loading}
        onConfirm={() => action.onClick?.()}
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Leave this group?"
        tone="danger"
        trigger={trigger}
      />
    </Suspense>
  );
}

function getDecisionActionCopy(
  action: GroupPlanActionState,
): DecisionActionCopy {
  return {
    headline: getDecisionActionHeadline(action.mode),
    summary:
      action.mode === "invited" || action.mode === "member"
        ? null
        : action.summary,
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
