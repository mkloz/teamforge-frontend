import type {
  ActivityParticipant,
  Group,
  GroupMember,
  MemberRole,
  PlanHistoryItem,
} from "@/features/activity/lib/activity-contract";
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

interface GroupPanelMainSectionsProps {
  currentUserId: string | null;
  currentUserRole: MemberRole;
  cancelPlan: (planId: string) => Promise<void> | void;
  completePlan: (planId: string) => Promise<void> | void;
  confirmPlan: (planId: string) => Promise<void> | void;
  createNextGroupPlan: (
    plan: NonNullable<Group["plan"]>,
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
  memberCount: number;
  members: GroupMember[];
  onEditGroup: () => void;
  onEditPlan: () => void;
  pendingPlanAction: string | null;
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
  currentUserId,
  currentUserRole,
  cancelPlan,
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
  memberCount,
  members,
  onEditGroup,
  onEditPlan,
  pendingPlanAction,
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
        memberCount={memberCount}
        maxMembers={group.maxMembers}
        groupId={group.id}
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
        focusedPlanId={focusedPlanId}
        focusedProposalId={focusedProposalId}
        isGroupLocked={isGroupLocked}
        isOnline={isOnline}
        pendingPlanAction={pendingPlanAction}
        onCancelPlan={cancelPlan}
        onCompletePlan={completePlan}
        onConfirmPlan={confirmPlan}
        onCreateNextPlan={createNextGroupPlan}
        onEditPlan={onEditPlan}
        governanceCapabilities={capabilities}
      />

      <GroupMembersSection
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        group={group}
        inviteCandidates={inviteCandidates}
        inviteMember={inviteMember}
        invitingMemberId={invitingMemberId}
        isGroupLocked={isGroupLocked}
        isOnline={isOnline}
        members={members}
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
}: {
  currentPlan: Group["plan"];
  currentUserRole: MemberRole;
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  isGroupLocked: boolean;
  isOnline: boolean;
  pendingPlanAction: string | null;
  onCancelPlan: (planId: string) => Promise<void> | void;
  onCompletePlan: (planId: string) => Promise<void> | void;
  onConfirmPlan: (planId: string) => Promise<void> | void;
  onCreateNextPlan: (plan: CurrentGroupPlan) => Promise<void> | void;
  onEditPlan: () => void;
  governanceCapabilities: GroupGovernance["capabilities"] | null;
}) {
  if (!currentPlan) {
    return null;
  }

  return (
    <PlanSection
      plan={currentPlan}
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
          : () => onCreateNextPlan(currentPlan)
      }
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
  currentUserId,
  currentUserRole,
  group,
  inviteCandidates,
  inviteMember,
  invitingMemberId,
  isGroupLocked,
  isOnline,
  members,
  removeMember,
  removingMemberId,
  setSelectedMember,
  canInviteMembers,
  canRemoveMembers,
}: {
  currentUserId: string | null;
  currentUserRole: MemberRole;
  group: Group;
  inviteCandidates: ActivityParticipant[];
  inviteMember: (memberId: string) => Promise<void> | void;
  invitingMemberId: string | null;
  isGroupLocked: boolean;
  isOnline: boolean;
  members: GroupMember[];
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
