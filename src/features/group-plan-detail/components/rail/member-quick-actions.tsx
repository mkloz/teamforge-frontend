import { Link } from "@tanstack/react-router";
import { type LucideIcon, Settings, UserPlus } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";

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
  const canSuggestPlanChange = canViewerSuggestPlanChange(detail);
  const canInviteMembers = detail.viewer.canInviteMembers;
  const canManageGroup = detail.viewer.canManageGroup;

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
  if (!capabilities.canSuggestPlanChange) {
    return null;
  }

  return (
    <DeferredPlanChangeDialog
      detail={detail}
      disabled={proposalActions.isSubmitting || !proposalActions.isOnline}
      isCreating={proposalActions.isCreating}
      isOnline={proposalActions.isOnline}
      onCreate={proposalActions.createProposal}
    />
  );
}

function DeferredPlanChangeDialog({
  detail,
  disabled,
  isCreating,
  isOnline,
  onCreate,
}: {
  detail: GroupPlanDetail;
  disabled: boolean;
  isCreating: boolean;
  isOnline: boolean;
  onCreate: CreateProposalAction;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = disabled || !detail.plan;
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
      What would you change?
    </Button>
  );

  if (!isLoaded) {
    return trigger;
  }

  return (
    <Suspense
      fallback={
        <Button variant="outline" size="sm" loading disabled>
          What would you change?
        </Button>
      }
    >
      <PlanChangeDialog
        detail={detail}
        disabled={disabled}
        isCreating={isCreating}
        isOnline={isOnline}
        onCreate={onCreate}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </Suspense>
  );
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
