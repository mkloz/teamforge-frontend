import type {
  ActivityParticipant,
  Group,
  GroupMember,
  MemberRole,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

import { ActionsSection } from "../actions-section";
import { isGroupActionsLocked } from "../actions-section/group-action-rules";
import { GroupIdentitySection } from "../group-identity-section";
import { MembersSection } from "../members-section";
import { PinnedMessagesSection } from "../pinned-messages-section";
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
  disbandGroup: () => Promise<void> | void;
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  group: Group;
  inviteCandidates: ActivityParticipant[];
  inviteMember: (memberId: string) => Promise<void> | void;
  invitingMemberId: string | null;
  isDisbanding: boolean;
  isLeaving: boolean;
  jumpToPinnedMessage: (messageId: string) => void;
  leaveGroup: () => Promise<void> | void;
  memberCount: number;
  members: GroupMember[];
  onEditGroup: () => void;
  onEditPlan: () => void;
  pendingPlanAction: string | null;
  removeMember: (memberId: string) => Promise<void> | void;
  removingMemberId: string | null;
  setSelectedMember: (member: GroupMember) => void;
  unpinMessage: (message: UnifiedMessage) => Promise<void> | void;
}

export function GroupPanelMainSections({
  currentUserId,
  currentUserRole,
  cancelPlan,
  completePlan,
  confirmPlan,
  createNextGroupPlan,
  disbandGroup,
  focusedPlanId,
  focusedProposalId,
  group,
  inviteCandidates,
  inviteMember,
  invitingMemberId,
  isDisbanding,
  isLeaving,
  jumpToPinnedMessage,
  leaveGroup,
  memberCount,
  members,
  onEditGroup,
  onEditPlan,
  pendingPlanAction,
  removeMember,
  removingMemberId,
  setSelectedMember,
  unpinMessage,
}: GroupPanelMainSectionsProps) {
  const isGroupLocked = isGroupActionsLocked(group.status);
  const currentPlan = group.plan;

  return (
    <div className="flex flex-col gap-7 px-5 pt-0 pb-7">
      <GroupIdentitySection
        activity={group.activity}
        avatar={group.avatar}
        coverImage={group.plan?.coverImage ?? null}
        createdAt={group.createdAt}
        currentUserRole={currentUserRole}
        description={group.description}
        isReadOnly={isGroupLocked}
        memberCount={memberCount}
        maxMembers={group.maxMembers}
        groupId={group.id}
        name={group.name}
        onEditGroup={onEditGroup}
        plan={group.plan}
        status={group.status}
      />

      {currentPlan && (
        <PlanSection
          plan={currentPlan}
          isFocused={focusedPlanId === currentPlan.id}
          focusedProposalId={focusedProposalId}
          isReadOnly={isGroupLocked}
          currentUserRole={currentUserRole}
          pendingAction={pendingPlanAction}
          onCancelPlan={() => cancelPlan(currentPlan.id)}
          onCompletePlan={() => completePlan(currentPlan.id)}
          onConfirmPlan={() => confirmPlan(currentPlan.id)}
          onCreateNextPlan={() => createNextGroupPlan(currentPlan)}
          onEditPlan={onEditPlan}
        />
      )}

      {group.chat?.pinnedMessages && group.chat.pinnedMessages.length > 0 && (
        <PinnedMessagesSection
          onJumpToMessage={jumpToPinnedMessage}
          onUnpinMessage={unpinMessage}
          pinnedMessages={group.chat.pinnedMessages}
        />
      )}

      {members.length > 0 && (
        <MembersSection
          members={members}
          maxMembers={group.maxMembers}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isReadOnly={isGroupLocked}
          inviteCandidates={inviteCandidates}
          invitingMemberId={invitingMemberId}
          onInviteMember={inviteMember}
          onRemoveMember={removeMember}
          onShowProfile={setSelectedMember}
          removingMemberId={removingMemberId}
        />
      )}

      <PlanHistorySection
        groupId={group.id}
        history={group.planHistory ?? []}
      />

      {!isGroupLocked ? (
        <ActionsSection
          currentUserRole={currentUserRole}
          groupStatus={group.status}
          isDisbanding={isDisbanding}
          isLeaving={isLeaving}
          onDisbandGroup={disbandGroup}
          onLeaveGroup={leaveGroup}
        />
      ) : (
        <ArchivedGroupFooter status={group.status} />
      )}
    </div>
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
