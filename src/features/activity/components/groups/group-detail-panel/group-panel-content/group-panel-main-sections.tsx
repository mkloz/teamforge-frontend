import type {
  ActivityParticipant,
  Group,
  GroupMember,
  MemberRole,
  PlanHistoryItem,
} from "@/features/activity/lib/activity-contract";
import type { Invite } from "@/shared/schemas";
import {
  type GroupGovernance,
  hasMissingAutoGovernance,
  isSystemManagedGroupGovernance,
  NO_GROUP_GOVERNANCE_CAPABILITIES,
} from "@/shared/schemas/group-governance";
import { ActionsSection } from "../actions-section";
import { isGroupActionsLocked } from "../actions-section/group-action-rules";
import { GroupIdentitySection } from "../group-identity-section";
import { MembersSection } from "../members-section";
import { PlanHistorySection } from "../plan-history-section";
import { PlanSection } from "../plan-section";
import type { RepeatPlanOptions } from "../plan-section/plan-lifecycle-actions";

interface GroupPanelMainSectionsProps {
  cancelInvitation: (inviteId: string) => Promise<void> | void;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  cancelPlan: (planId: string) => Promise<void> | void;
  cancellingInviteId: string | null;
  completePlan: (planId: string) => Promise<void> | void;
  confirmPlan: (planId: string) => Promise<void> | void;
  createNextGroupPlan: (
    plan: NonNullable<Group["plan"]>,
    options?: RepeatPlanOptions,
  ) => Promise<void> | void;
  createPlanFromHistory: (plan: PlanHistoryItem) => Promise<void> | void;
  disbandGroup: () => Promise<void> | void;
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  group: Group;
  inviteCandidates: ActivityParticipant[];
  inviteMember: (memberId: string) => Promise<void> | void;
  invitingMemberId: string | null;
  isDisbanding: boolean;
  isOnline: boolean;
  isLeaving: boolean;
  leaveGroup: () => Promise<void> | void;
  members: GroupMember[];
  memberCount: number;
  onEditGroup: () => void;
  onEditPlan: () => void;
  pendingPlanAction: string | null;
  pendingInvitations: Invite[];
  removeMember: (memberId: string) => Promise<void> | void;
  removingMemberId: string | null;
  setSelectedMember: (member: GroupMember) => void;
}

type CurrentGroupPlan = NonNullable<Group["plan"]>;

interface GroupPanelMembershipActionState {
  isDisbanding: boolean;
  isGroupLocked: boolean;
  isLeaving: boolean;
  isOnline: boolean;
}

export function GroupPanelMainSections({
  cancelInvitation,
  currentUserId,
  currentUserRole,
  cancelPlan,
  cancellingInviteId,
  completePlan,
  confirmPlan,
  createNextGroupPlan,
  createPlanFromHistory,
  disbandGroup,
  focusedPlanId,
  focusedProposalId,
  group,
  inviteCandidates,
  inviteMember,
  invitingMemberId,
  isDisbanding,
  isOnline,
  isLeaving,
  leaveGroup,
  members,
  memberCount,
  onEditGroup,
  onEditPlan,
  pendingPlanAction,
  pendingInvitations,
  removeMember,
  removingMemberId,
  setSelectedMember,
}: GroupPanelMainSectionsProps) {
  const isGroupLocked = isGroupActionsLocked(group.status);
  const governance = group.governance;
  const isSystemManaged = isSystemManagedGroupGovernance(governance);
  const hasMissingGovernance = hasMissingAutoGovernance({
    forgeMode: group.activity?.forgeMode,
    governance,
  });
  const capabilities = isSystemManaged
    ? governance.capabilities
    : hasMissingGovernance
      ? NO_GROUP_GOVERNANCE_CAPABILITIES
      : null;
  const hasGeneratedMembership = isSystemManaged || hasMissingGovernance;

  return (
    <div className="flex flex-col gap-7 px-5 pt-0 pb-7">
      <GroupIdentitySection
        activity={group.activity}
        activityId={group.activityId}
        avatar={group.avatar}
        avatarMedia={group.avatarMedia ?? null}
        coverImage={group.plan?.coverImage ?? null}
        createdAt={group.createdAt}
        currentUserRole={currentUserRole}
        canCreateJoinLinks={
          isSystemManaged
            ? governance.chat.capabilities.canCreateJoinLinks
            : hasMissingGovernance
              ? false
              : undefined
        }
        canEditGroup={capabilities?.canEditGroupIdentity}
        canLeaveGroup={capabilities?.canLeaveGroup}
        canSuggestPlanChange={capabilities?.canSuggestPlanChange}
        description={group.description}
        isReadOnly={isGroupLocked}
        groupId={group.id}
        maxMembers={group.maxMembers}
        memberCount={memberCount + pendingInvitations.length}
        isOnline={isOnline}
        name={group.name}
        onEditGroup={onEditGroup}
        plan={group.plan}
        status={group.status}
        isSystemManaged={hasGeneratedMembership}
      />

      <CurrentPlanSection
        currentPlan={group.plan}
        currentUserRole={currentUserRole}
        groupName={group.name}
        focusedPlanId={focusedPlanId}
        focusedProposalId={focusedProposalId}
        isGroupLocked={isGroupLocked}
        isOnline={isOnline}
        pendingPlanAction={pendingPlanAction}
        onCancelPlan={cancelPlan}
        onCompletePlan={completePlan}
        onConfirmPlan={confirmPlan}
        onCreateNextPlan={createNextGroupPlan}
        repeatCandidates={members
          .filter((member) => member.userId !== currentUserId && !member.leftAt)
          .map((member) => ({
            name: member.user?.name ?? "Member",
            userId: member.userId,
          }))}
        onEditPlan={onEditPlan}
        governanceCapabilities={capabilities}
      />

      <GroupMembersSection
        cancelInvitation={cancelInvitation}
        cancellingInviteId={cancellingInviteId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        group={group}
        inviteCandidates={inviteCandidates}
        inviteMember={inviteMember}
        invitingMemberId={invitingMemberId}
        isGroupLocked={isGroupLocked}
        isOnline={isOnline}
        members={members}
        pendingInvitations={pendingInvitations}
        removeMember={removeMember}
        removingMemberId={removingMemberId}
        setSelectedMember={setSelectedMember}
        canInviteMembers={capabilities?.canInviteMembers}
        canRemoveMembers={capabilities?.canRemoveMembers}
      />

      <GroupPlanHistorySection
        focusedPlanId={focusedPlanId}
        group={group}
        isGroupLocked={isGroupLocked}
        isOnline={isOnline}
        pendingPlanAction={pendingPlanAction}
        onUseAsTemplate={createPlanFromHistory}
        canCreateNextPlan={capabilities?.canCreateNextPlan}
      />

      <GroupPanelMembershipControls
        actionState={{
          isDisbanding,
          isGroupLocked,
          isLeaving,
          isOnline,
        }}
        currentUserRole={currentUserRole}
        disbandGroup={disbandGroup}
        group={group}
        leaveGroup={leaveGroup}
        canDisbandGroup={capabilities?.canDisbandGroup}
        canLeaveGroup={capabilities?.canLeaveGroup}
      />
    </div>
  );
}

function CurrentPlanSection({
  currentPlan,
  currentUserRole,
  groupName,
  focusedPlanId,
  focusedProposalId,
  isGroupLocked,
  isOnline,
  pendingPlanAction,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  governanceCapabilities,
  repeatCandidates,
}: {
  currentPlan: Group["plan"];
  currentUserRole: MemberRole;
  groupName: string;
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  isGroupLocked: boolean;
  isOnline: boolean;
  pendingPlanAction: string | null;
  onCancelPlan: (planId: string) => Promise<void> | void;
  onCompletePlan: (planId: string) => Promise<void> | void;
  onConfirmPlan: (planId: string) => Promise<void> | void;
  onCreateNextPlan: (
    plan: CurrentGroupPlan,
    options?: RepeatPlanOptions,
  ) => Promise<void> | void;
  onEditPlan: () => void;
  governanceCapabilities: GroupGovernance["capabilities"] | null;
  repeatCandidates: Array<{ name: string; userId: string }>;
}) {
  if (!currentPlan) {
    return null;
  }

  return (
    <PlanSection
      plan={currentPlan}
      groupName={groupName}
      isFocused={focusedPlanId === currentPlan.id}
      focusedProposalId={focusedProposalId}
      isReadOnly={isGroupLocked}
      isOnline={isOnline}
      currentUserRole={currentUserRole}
      pendingAction={pendingPlanAction}
      onCancelPlan={
        governanceCapabilities?.canCancelPlanDirectly === false
          ? undefined
          : () => onCancelPlan(currentPlan.id)
      }
      onCompletePlan={
        governanceCapabilities?.canCompletePlanDirectly === false
          ? undefined
          : () => onCompletePlan(currentPlan.id)
      }
      onConfirmPlan={
        governanceCapabilities?.canConfirmPlanDirectly === false
          ? undefined
          : () => onConfirmPlan(currentPlan.id)
      }
      onCreateNextPlan={
        governanceCapabilities?.canCreateNextPlan === false
          ? undefined
          : (options) => onCreateNextPlan(currentPlan, options)
      }
      repeatCandidates={repeatCandidates}
      onEditPlan={
        governanceCapabilities?.canUpdatePlanDirectly === false
          ? undefined
          : onEditPlan
      }
      canManagePlanDirectly={
        governanceCapabilities
          ? [
              governanceCapabilities.canCancelPlanDirectly,
              governanceCapabilities.canCompletePlanDirectly,
              governanceCapabilities.canConfirmPlanDirectly,
              governanceCapabilities.canCreateNextPlan,
              governanceCapabilities.canUpdatePlanDirectly,
            ].some(Boolean)
          : undefined
      }
    />
  );
}

function GroupMembersSection({
  cancelInvitation,
  cancellingInviteId,
  currentUserId,
  currentUserRole,
  group,
  inviteCandidates,
  inviteMember,
  invitingMemberId,
  isGroupLocked,
  isOnline,
  members,
  pendingInvitations,
  removeMember,
  removingMemberId,
  setSelectedMember,
  canInviteMembers,
  canRemoveMembers,
}: {
  cancelInvitation: (inviteId: string) => Promise<void> | void;
  cancellingInviteId: string | null;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  group: Group;
  inviteCandidates: ActivityParticipant[];
  inviteMember: (memberId: string) => Promise<void> | void;
  invitingMemberId: string | null;
  isGroupLocked: boolean;
  isOnline: boolean;
  members: GroupMember[];
  pendingInvitations: Invite[];
  removeMember: (memberId: string) => Promise<void> | void;
  removingMemberId: string | null;
  setSelectedMember: (member: GroupMember) => void;
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
}) {
  if (members.length === 0) {
    return null;
  }

  return (
    <MembersSection
      members={members}
      pendingInvitations={pendingInvitations}
      maxMembers={group.maxMembers}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      isReadOnly={isGroupLocked}
      isOnline={isOnline}
      inviteCandidates={inviteCandidates}
      invitingMemberId={invitingMemberId}
      onInviteMember={inviteMember}
      onRemoveMember={removeMember}
      onShowProfile={setSelectedMember}
      removingMemberId={removingMemberId}
      canInviteMembers={canInviteMembers}
      canRemoveMembers={canRemoveMembers}
      cancellingInviteId={cancellingInviteId}
      onCancelInvitation={cancelInvitation}
    />
  );
}

function GroupPlanHistorySection({
  focusedPlanId,
  group,
  isGroupLocked,
  isOnline,
  pendingPlanAction,
  onUseAsTemplate,
  canCreateNextPlan,
}: {
  focusedPlanId: string | null;
  group: Group;
  isGroupLocked: boolean;
  isOnline: boolean;
  pendingPlanAction: string | null;
  onUseAsTemplate: (plan: PlanHistoryItem) => Promise<void> | void;
  canCreateNextPlan?: boolean;
}) {
  return (
    <PlanHistorySection
      focusedPlanId={focusedPlanId}
      history={group.planHistory ?? []}
      isTemplateActionDisabled={
        pendingPlanAction !== null ||
        isGroupLocked ||
        canCreateNextPlan === false
      }
      isOnline={isOnline}
      isTemplateActionPending={pendingPlanAction === "create-next-plan"}
      onUseAsTemplate={
        canCreateNextPlan === false ? undefined : onUseAsTemplate
      }
    />
  );
}

function GroupPanelMembershipControls({
  actionState,
  currentUserRole,
  disbandGroup,
  group,
  leaveGroup,
  canDisbandGroup,
  canLeaveGroup,
}: {
  actionState: GroupPanelMembershipActionState;
  currentUserRole: MemberRole;
  disbandGroup: () => Promise<void> | void;
  group: Group;
  leaveGroup: () => Promise<void> | void;
  canDisbandGroup?: boolean;
  canLeaveGroup?: boolean;
}) {
  if (actionState.isGroupLocked) {
    return <ArchivedGroupFooter status={group.status} />;
  }

  return (
    <ActionsSection
      currentUserRole={currentUserRole}
      groupStatus={group.status}
      isDisbanding={actionState.isDisbanding}
      isOnline={actionState.isOnline}
      isLeaving={actionState.isLeaving}
      onDisbandGroup={disbandGroup}
      onLeaveGroup={leaveGroup}
      canDisband={canDisbandGroup}
      canLeave={canLeaveGroup}
    />
  );
}

function ArchivedGroupFooter({ status }: { status: Group["status"] }) {
  const label =
    status === "DISBANDED"
      ? "Group closed and kept for history."
      : "Group controls are unavailable.";

  return (
    <footer className="border-border/70 border-t pt-4 pb-2">
      <p className="text-center font-medium text-slate-muted text-xs">
        {label}
      </p>
    </footer>
  );
}
