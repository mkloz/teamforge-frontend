import { Link } from "@tanstack/react-router";
import { type LucideIcon, Settings, UserPlus } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";

interface MemberQuickActionsProps {
  detail: GroupPlanDetail;
}

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
        {capabilities.canSuggestPlanChange ? (
          <DeferredPlanChangeDialog
            detail={detail}
            disabled={proposalActions.isSubmitting || !proposalActions.isOnline}
            isCreating={proposalActions.isCreating}
            isOnline={proposalActions.isOnline}
            onCreate={proposalActions.createProposal}
          />
        ) : null}
        {capabilities.canInviteMembers ? (
          <QuickActionLink
            groupId={detail.group.id}
            icon={UserPlus}
            label="Invite a friend"
          />
        ) : null}
        {capabilities.canManageGroup ? (
          <QuickActionLink
            groupId={detail.group.id}
            icon={Settings}
            label="Manage group"
          />
        ) : null}
      </div>
    </section>
  );
}

function getMemberQuickActionCapabilities(detail: GroupPlanDetail) {
  const canSuggestPlanChange = Boolean(
    detail.viewer.canSuggestPlanChange && detail.plan,
  );
  const canInviteMembers = detail.viewer.canInviteMembers;
  const canManageGroup = detail.viewer.canManageGroup;

  return {
    canInviteMembers,
    canManageGroup,
    canSuggestPlanChange,
    hasAnyAction: canSuggestPlanChange || canInviteMembers || canManageGroup,
  };
}

type CreateProposalAction = ReturnType<
  typeof useGroupPlanProposalActions
>["createProposal"];

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
