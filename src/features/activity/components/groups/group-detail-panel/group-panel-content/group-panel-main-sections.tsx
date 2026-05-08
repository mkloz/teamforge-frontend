import { motion } from "framer-motion";
import type {
  ActivityParticipant,
  Group,
  GroupMember,
  MemberRole,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

import { ActionsSection } from "../actions-section";
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
  removeMember,
  removingMemberId,
  setSelectedMember,
  unpinMessage,
}: GroupPanelMainSectionsProps) {
  return (
    <motion.div
      variants={groupPanelContainerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 pt-3 pb-6"
    >
      <motion.div variants={groupPanelItemVariants}>
        <GroupIdentitySection
          name={group.name}
          description={group.description}
          memberCount={memberCount}
          maxMembers={group.maxMembers}
        />
      </motion.div>

      {group.plan && (
        <motion.div variants={groupPanelItemVariants} className="mt-5">
          <PlanSection
            plan={group.plan}
            isFocused={focusedPlanId === group.plan.id}
            focusedProposalId={focusedProposalId}
          />
        </motion.div>
      )}

      {group.chat?.pinnedMessages && group.chat.pinnedMessages.length > 0 && (
        <motion.div variants={groupPanelItemVariants} className="mt-6">
          <PinnedMessagesSection
            onJumpToMessage={jumpToPinnedMessage}
            onUnpinMessage={unpinMessage}
            pinnedMessages={group.chat.pinnedMessages}
          />
        </motion.div>
      )}

      <div className="my-6 border-t border-border/50" />

      {members.length > 0 && (
        <motion.div variants={groupPanelItemVariants}>
          <MembersSection
            members={members}
            maxMembers={group.maxMembers}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            inviteCandidates={inviteCandidates}
            invitingMemberId={invitingMemberId}
            onInviteMember={inviteMember}
            onRemoveMember={removeMember}
            onShowProfile={setSelectedMember}
            removingMemberId={removingMemberId}
          />
        </motion.div>
      )}

      <motion.div variants={groupPanelItemVariants} className="mt-8">
        <PlanHistorySection
          history={group.planHistory ?? []}
          userRole={currentUserRole}
        />
      </motion.div>

      <motion.div variants={groupPanelItemVariants} className="mt-8">
        <ActionsSection
          currentUserRole={currentUserRole}
          groupStatus={group.status}
          isDisbanding={isDisbanding}
          isLeaving={isLeaving}
          onDisbandGroup={disbandGroup}
          onLeaveGroup={leaveGroup}
        />
      </motion.div>
    </motion.div>
  );
}
