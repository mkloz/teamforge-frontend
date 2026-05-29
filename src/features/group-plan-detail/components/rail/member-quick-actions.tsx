import { Link } from "@tanstack/react-router";
import { type LucideIcon, Settings, UserPlus } from "lucide-react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { PlanChangeDialog } from "@/features/group-plan-detail/components/plan-change-dialog";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";

interface MemberQuickActionsProps {
  detail: GroupPlanDetail;
}

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
        className="type-signature-label px-1 font-black text-forge-teal uppercase tracking-widest"
      >
        Quick actions
      </h3>
      <div className="grid gap-1">
        {capabilities.canSuggestPlanChange ? (
          <PlanChangeDialog
            detail={detail}
            disabled={proposalActions.isSubmitting}
            isCreating={proposalActions.isCreating}
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
