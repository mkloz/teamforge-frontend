import { Link } from "@tanstack/react-router";
import { type LucideIcon, Settings, UserPlus } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";
import type { PlanNextRequiredAction } from "@/shared/schemas/enums";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";

interface MemberQuickActionsProps {
  detail: GroupPlanDetail;
}

type MemberQuickActionCapabilities = ReturnType<
  typeof getMemberQuickActionCapabilities
>;

const QUICK_ACTION_LINKS = [
  {
    capability: "canInviteMembers",
    icon: UserPlus,
    label: "Invite a friend",
  },
  {
    capability: "canManageGroup",
    icon: Settings,
    label: "Manage group",
  },
] satisfies readonly {
  capability: keyof Pick<
    MemberQuickActionCapabilities,
    "canInviteMembers" | "canManageGroup"
  >;
  icon: LucideIcon;
  label: string;
}[];

const PlanChangeDialog = lazy(() =>
  import("@/features/group-plan-detail/components/plan-change-dialog").then(
    (module) => ({ default: module.PlanChangeDialog }),
  ),
);

export function MemberQuickActions({ detail }: MemberQuickActionsProps) {
  const proposalActions = useGroupPlanProposalActions({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });
  const capabilities = getMemberQuickActionCapabilities(detail);

  if (!capabilities.hasAnyAction) return null;

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="member-quick-actions"
    >
      <h3
        id="member-quick-actions"
        className="px-1 font-bold text-forge-teal text-xs"
      >
        Quick actions
      </h3>
      <div className="grid gap-1">
        <PlanChangeQuickAction
          capabilities={capabilities}
          detail={detail}
          proposalActions={proposalActions}
        />
        {QUICK_ACTION_LINKS.map((action) => (
          <MemberQuickActionLink
            key={action.capability}
            action={action}
            capabilities={capabilities}
            groupId={detail.group.id}
          />
        ))}
      </div>
    </section>
  );
}

function getMemberQuickActionCapabilities(detail: GroupPlanDetail) {
  const governance = detail.governance;
  const isSystemManaged = isSystemManagedGroupGovernance(governance);
  const isGovernanceUnknown = governance === undefined;
  const canSuggestPlanChange = isSystemManaged
    ? detail.viewer.canSuggestPlanChange &&
      governance.capabilities.canSuggestPlanChange &&
      Boolean(detail.plan)
    : !isGovernanceUnknown && canViewerSuggestPlanChange(detail);
  const canInviteMembers = isSystemManaged
    ? detail.viewer.canInviteMembers && governance.capabilities.canInviteMembers
    : !isGovernanceUnknown && detail.viewer.canInviteMembers;
  const canManageGroup = isSystemManaged
    ? detail.viewer.canManageGroup &&
      (governance.capabilities.canEditGroupIdentity ||
        governance.capabilities.canUpdatePlanDirectly)
    : !isGovernanceUnknown && detail.viewer.canManageGroup;
  return {
    canInviteMembers,
    canManageGroup,
    canSuggestPlanChange,
    hasAnyAction: [canSuggestPlanChange, canInviteMembers, canManageGroup].some(
      Boolean,
    ),
  };
}

function canViewerSuggestPlanChange(detail: GroupPlanDetail) {
  if (!detail.viewer.canSuggestPlanChange) {
    return false;
  }

  return Boolean(detail.plan);
}

type CreateProposalAction = ReturnType<
  typeof useGroupPlanProposalActions
>["createProposal"];

type GroupPlanProposalActions = ReturnType<typeof useGroupPlanProposalActions>;

function PlanChangeQuickAction({
  capabilities,
  detail,
  proposalActions,
}: {
  capabilities: MemberQuickActionCapabilities;
  detail: GroupPlanDetail;
  proposalActions: GroupPlanProposalActions;
}) {
  const nextAction = detail.plan?.nextRequiredAction ?? null;

  if (isPlanVoteAction(nextAction)) {
    return null;
  }

  if (!capabilities.canSuggestPlanChange) {
    return null;
  }

  return (
    <DeferredPlanChangeDialog
      detail={detail}
      disabled={proposalActions.isSubmitting || !proposalActions.isOnline}
      isCreating={proposalActions.isCreating}
      isOnline={proposalActions.isOnline}
      initialField={getPlanChangeInitialField(nextAction)}
      onCreate={proposalActions.createProposal}
    />
  );
}

function DeferredPlanChangeDialog({
  detail,
  disabled,
  isCreating,
  isOnline,
  initialField,
  onCreate,
}: {
  detail: GroupPlanDetail;
  disabled: boolean;
  isCreating: boolean;
  isOnline: boolean;
  initialField: "DATE_TIME" | "LOCATION" | undefined;
  onCreate: CreateProposalAction;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = disabled || !detail.plan;
  const actionLabel = getPlanChangeActionLabel(detail);
  const trigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={isDisabled}
      title={isOnline ? undefined : "Reconnect before suggesting changes."}
      onClick={() => {
        setIsLoaded(true);
        setIsOpen(true);
      }}
    >
      {actionLabel}
    </Button>
  );

  if (!isLoaded) {
    return trigger;
  }

  return (
    <Suspense
      fallback={
        <Button variant="outline" size="sm" loading disabled>
          {actionLabel}
        </Button>
      }
    >
      <PlanChangeDialog
        key={initialField ?? "standard"}
        detail={detail}
        disabled={disabled}
        isCreating={isCreating}
        isOnline={isOnline}
        initialField={initialField}
        onCreate={onCreate}
        open={isOpen}
        onOpenChange={setIsOpen}
        triggerLabel={actionLabel}
      />
    </Suspense>
  );
}

function getPlanChangeActionLabel(detail: GroupPlanDetail) {
  const action = detail.plan?.nextRequiredAction;

  if (action === "PROPOSE_TIME") {
    return "Propose a time";
  }

  if (action === "PROPOSE_LOCATION") {
    return "Propose a place";
  }

  return "Suggest a plan change";
}

function getPlanChangeInitialField(action: PlanNextRequiredAction | null) {
  if (action === "PROPOSE_TIME") {
    return "DATE_TIME" as const;
  }

  if (action === "PROPOSE_LOCATION") {
    return "LOCATION" as const;
  }

  return undefined;
}

function isPlanVoteAction(
  action: PlanNextRequiredAction | null,
): action is "VOTE_LOCATION" | "VOTE_TIME" {
  return action === "VOTE_LOCATION" || action === "VOTE_TIME";
}

interface QuickActionLinkProps {
  groupId: string;
  icon: LucideIcon;
  label: string;
}

function MemberQuickActionLink({
  action,
  capabilities,
  groupId,
}: {
  action: (typeof QUICK_ACTION_LINKS)[number];
  capabilities: MemberQuickActionCapabilities;
  groupId: string;
}) {
  if (!capabilities[action.capability]) {
    return null;
  }

  return (
    <QuickActionLink
      groupId={groupId}
      icon={action.icon}
      label={action.label}
    />
  );
}

function QuickActionLink({ groupId, icon: Icon, label }: QuickActionLinkProps) {
  return (
    <Button asChild variant="outline" size="sm" className="w-full">
      <Link {...buildActivityGroupHubNavigation(groupId)}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
