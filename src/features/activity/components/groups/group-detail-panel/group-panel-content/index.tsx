import type { Group } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

import {
  EditGroupIdentityDialog,
  EditPlanDetailsDialog,
} from "../edit-group-identity-dialog";
import { GroupCoverHeader } from "./group-cover-header";
import { GroupPanelHeader } from "./group-panel-header";
import { GroupPanelMainSections } from "./group-panel-main-sections";
import { GroupPanelScrollArea } from "./group-panel-scroll-area";
import { SelectedMemberProfile } from "./selected-member-profile";
import { useGroupPanelContent } from "./use-group-panel-content";

interface GroupPanelContentProps {
  group: Group;
  focusedPlanId?: string | null;
  focusedProposalId?: string | null;
  selectedMemberId?: string | null;
  onClose: () => void;
  onSelectedMemberIdChange?: (memberId: string | null) => void;
  isMobile?: boolean;
}

export function GroupPanelContent({
  group,
  focusedPlanId = null,
  focusedProposalId = null,
  selectedMemberId = null,
  onClose,
  onSelectedMemberIdChange,
  isMobile = false,
}: GroupPanelContentProps) {
  const {
    currentUserId,
    currentUserRole,
    cancelPlan,
    completePlan,
    confirmPlan,
    createNextGroupPlan,
    createPlanFromHistory,
    disbandGroup,
    inviteCandidates,
    inviteMember,
    invitingMemberId,
    isDisbanding,
    isEditOpen,
    isOnline,
    isLeaving,
    isPlanEditOpen,
    leaveGroup,
    memberChat,
    memberCount,
    members,
    pendingPlanAction,
    removeMember,
    removingMemberId,
    selectedMember,
    setIsEditOpen,
    setIsPlanEditOpen,
    setSelectedMember,
  } = useGroupPanelContent({
    group,
    selectedMemberId,
    onSelectedMemberIdChange,
  });

  if (selectedMember && memberChat) {
    return (
      <SelectedMemberProfile
        isMobile={isMobile}
        member={selectedMember}
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
      {!isMobile && (
        <GroupPanelHeader
          groupId={group.id}
          groupName={group.name}
          onClose={onClose}
        />
      )}

      <GroupPanelScrollArea isMobile={isMobile} resetKey={group.id}>
        {({ isCompactVisible, scrollToTop }) => (
          <>
            <GroupCoverHeader
              group={group}
              isCompactVisible={isCompactVisible}
              isMobile={isMobile}
              onClose={onClose}
              onCompactHeaderClick={scrollToTop}
            />

            <GroupPanelMainSections
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              cancelPlan={cancelPlan}
              completePlan={completePlan}
              confirmPlan={confirmPlan}
              createNextGroupPlan={createNextGroupPlan}
              createPlanFromHistory={createPlanFromHistory}
              disbandGroup={disbandGroup}
              focusedPlanId={focusedPlanId}
              focusedProposalId={focusedProposalId}
              group={group}
              inviteCandidates={inviteCandidates}
              inviteMember={inviteMember}
              invitingMemberId={invitingMemberId}
              isDisbanding={isDisbanding}
              isOnline={isOnline}
              isLeaving={isLeaving}
              leaveGroup={leaveGroup}
              memberCount={memberCount}
              members={members}
              pendingPlanAction={pendingPlanAction}
              onEditGroup={() => setIsEditOpen(true)}
              onEditPlan={() => setIsPlanEditOpen(true)}
              removeMember={removeMember}
              removingMemberId={removingMemberId}
              setSelectedMember={setSelectedMember}
            />
          </>
        )}
      </GroupPanelScrollArea>

      {currentUserRole === "ADMIN" && (
        <>
          <EditGroupIdentityDialog
            group={group}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <EditPlanDetailsDialog
            group={group}
            open={isPlanEditOpen}
            onOpenChange={setIsPlanEditOpen}
          />
        </>
      )}
    </div>
  );
}
