import type { Group } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

import { EditGroupIdentityDialog } from "../edit-group-identity-dialog";
import { GroupCoverHeader } from "./group-cover-header";
import { GroupPanelHeader } from "./group-panel-header";
import { useGroupPanelContent } from "./use-group-panel-content";
import { GroupPanelMainSections } from "./group-panel-main-sections";
import { GroupPanelScrollArea } from "./group-panel-scroll-area";
import { SelectedMemberProfile } from "./selected-member-profile";

interface GroupPanelContentProps {
  group: Group;
  focusedPlanId?: string | null;
  focusedProposalId?: string | null;
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
  isMobile?: boolean;
}

export function GroupPanelContent({
  group,
  focusedPlanId = null,
  focusedProposalId = null,
  onClose,
  onJumpToMessage,
  isMobile = false,
}: GroupPanelContentProps) {
  const {
    currentUserId,
    currentUserRole,
    disbandGroup,
    inviteCandidates,
    inviteMember,
    invitingMemberId,
    isDisbanding,
    isEditOpen,
    isLeaving,
    jumpToPinnedMessage,
    leaveGroup,
    memberChat,
    memberCount,
    members,
    removeMember,
    removingMemberId,
    selectedMember,
    setIsEditOpen,
    setSelectedMember,
    unpinMessage,
  } = useGroupPanelContent({ group, isMobile, onClose, onJumpToMessage });

  if (selectedMember && memberChat) {
    return (
      <SelectedMemberProfile
        isMobile={isMobile}
        memberChat={memberChat}
        onBack={() => setSelectedMember(null)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isMobile && "flex-1",
      )}
    >
      {!isMobile && <GroupPanelHeader onClose={onClose} />}

      <GroupPanelScrollArea isMobile={isMobile}>
        <GroupCoverHeader
          currentUserRole={currentUserRole}
          group={group}
          isMobile={isMobile}
          onClose={onClose}
          onEditGroup={() => setIsEditOpen(true)}
        />

        <GroupPanelMainSections
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          disbandGroup={disbandGroup}
          focusedPlanId={focusedPlanId}
          focusedProposalId={focusedProposalId}
          group={group}
          inviteCandidates={inviteCandidates}
          inviteMember={inviteMember}
          invitingMemberId={invitingMemberId}
          isDisbanding={isDisbanding}
          isLeaving={isLeaving}
          jumpToPinnedMessage={jumpToPinnedMessage}
          leaveGroup={leaveGroup}
          memberCount={memberCount}
          members={members}
          removeMember={removeMember}
          removingMemberId={removingMemberId}
          setSelectedMember={setSelectedMember}
          unpinMessage={unpinMessage}
        />
      </GroupPanelScrollArea>

      {currentUserRole === "ADMIN" && (
        <EditGroupIdentityDialog
          group={group}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}
