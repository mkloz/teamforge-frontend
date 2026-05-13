import { motion } from "framer-motion";
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
import {
  groupPanelContainerVariants,
  groupPanelItemVariants,
} from "./group-panel-animations";

interface GroupPanelMainSectionsProps {
  currentUserId: string | null;
  currentUserRole: MemberRole;
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
  removeMember: (memberId: string) => Promise<void> | void;
  removingMemberId: string | null;
  setSelectedMember: (member: GroupMember) => void;
  unpinMessage: (message: UnifiedMessage) => Promise<void> | void;
}

export function GroupPanelMainSections({
  currentUserId,
  currentUserRole,
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
  removeMember,
  removingMemberId,
  setSelectedMember,
  unpinMessage,
}: GroupPanelMainSectionsProps) {
  const isGroupLocked = isGroupActionsLocked(group.status);

  return (
    <motion.div
      variants={groupPanelContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-7 px-5 pt-0 pb-7"
    >
      <motion.div variants={groupPanelItemVariants}>
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
      </motion.div>

      {group.plan && (
        <motion.div variants={groupPanelItemVariants}>
          <PlanSection
            plan={group.plan}
            isFocused={focusedPlanId === group.plan.id}
            focusedProposalId={focusedProposalId}
            isReadOnly={isGroupLocked}
          />
        </motion.div>
      )}

      {group.chat?.pinnedMessages && group.chat.pinnedMessages.length > 0 && (
        <motion.div variants={groupPanelItemVariants}>
          <PinnedMessagesSection
            onJumpToMessage={jumpToPinnedMessage}
            onUnpinMessage={unpinMessage}
            pinnedMessages={group.chat.pinnedMessages}
          />
        </motion.div>
      )}

      {members.length > 0 && (
        <motion.div variants={groupPanelItemVariants}>
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
        </motion.div>
      )}

      <motion.div variants={groupPanelItemVariants}>
        <PlanHistorySection
          groupId={group.id}
          history={group.planHistory ?? []}
        />
      </motion.div>

      {!isGroupLocked ? (
        <motion.div variants={groupPanelItemVariants}>
          <ActionsSection
            currentUserRole={currentUserRole}
            groupStatus={group.status}
            isDisbanding={isDisbanding}
            isLeaving={isLeaving}
            onDisbandGroup={disbandGroup}
            onLeaveGroup={leaveGroup}
          />
        </motion.div>
      ) : (
        <motion.div variants={groupPanelItemVariants}>
          <ArchivedGroupFooter status={group.status} />
        </motion.div>
      )}
    </motion.div>
  );
}

function ArchivedGroupFooter({ status }: { status: Group["status"] }) {
  const label =
    status === "COMPLETED"
      ? "Group archived after the final plan."
      : "Group closed and kept for history.";

  return (
    <footer className="border-border/70 border-t pt-4 pb-2">
      <p className="text-center font-medium text-slate-muted text-xs">
        {label}
      </p>
    </footer>
  );
}
