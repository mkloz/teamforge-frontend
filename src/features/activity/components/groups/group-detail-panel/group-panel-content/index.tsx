import type { Group } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import {
  hasMissingAutoGovernance,
  isSystemManagedGroupGovernance,
} from "@/shared/schemas/group-governance";
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

type GroupPanelContentState = ReturnType<typeof useGroupPanelContent>;

export function GroupPanelContent({
  group,
  focusedPlanId = null,
  focusedProposalId = null,
  selectedMemberId = null,
  onClose,
  onSelectedMemberIdChange,
  isMobile = false,
}: GroupPanelContentProps) {
  const panel = useGroupPanelContent({
    group,
    selectedMemberId,
    onSelectedMemberIdChange,
  });

  const selectedMemberPanel = getSelectedMemberPanel({
    isMobile,
    memberChat: panel.memberChat,
    selectedMember: panel.selectedMember,
    setSelectedMember: panel.setSelectedMember,
  });

  if (selectedMemberPanel) {
    return selectedMemberPanel;
  }

  return (
    <GroupPanelShell
      focusedPlanId={focusedPlanId}
      focusedProposalId={focusedProposalId}
      group={group}
      isMobile={isMobile}
      onClose={onClose}
      panel={panel}
    />
  );
}

function getSelectedMemberPanel({
  isMobile,
  memberChat,
  selectedMember,
  setSelectedMember,
}: {
  isMobile: boolean;
  memberChat: GroupPanelContentState["memberChat"];
  selectedMember: GroupPanelContentState["selectedMember"];
  setSelectedMember: GroupPanelContentState["setSelectedMember"];
}) {
  if (!selectedMember || !memberChat) {
    return null;
  }

  return (
    <SelectedMemberProfile
      isMobile={isMobile}
      member={selectedMember}
      memberChat={memberChat}
      onBack={() => setSelectedMember(null)}
    />
  );
}

function GroupPanelShell({
  focusedPlanId,
  focusedProposalId,
  group,
  isMobile,
  onClose,
  panel,
}: {
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  group: Group;
  isMobile: boolean;
  onClose: () => void;
  panel: GroupPanelContentState;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isMobile && "flex-1",
      )}
    >
      <GroupPanelDesktopHeader
        groupId={group.id}
        groupName={group.name}
        isMobile={isMobile}
        onClose={onClose}
      />

      <GroupPanelContentScrollArea
        focusedPlanId={focusedPlanId}
        focusedProposalId={focusedProposalId}
        group={group}
        isMobile={isMobile}
        onClose={onClose}
        panel={panel}
      />

      <GroupPanelAdminDialogs group={group} panel={panel} />
    </div>
  );
}

function GroupPanelDesktopHeader({
  groupId,
  groupName,
  isMobile,
  onClose,
}: {
  groupId: string;
  groupName: string;
  isMobile: boolean;
  onClose: () => void;
}) {
  if (isMobile) {
    return null;
  }

  return (
    <GroupPanelHeader
      groupId={groupId}
      groupName={groupName}
      onClose={onClose}
    />
  );
}

function GroupPanelContentScrollArea({
  focusedPlanId,
  focusedProposalId,
  group,
  isMobile,
  onClose,
  panel,
}: {
  focusedPlanId: string | null;
  focusedProposalId: string | null;
  group: Group;
  isMobile: boolean;
  onClose: () => void;
  panel: GroupPanelContentState;
}) {
  return (
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
            currentUserId={panel.currentUserId}
            currentUserRole={panel.currentUserRole}
            cancelPlan={panel.cancelPlan}
            completePlan={panel.completePlan}
            confirmPlan={panel.confirmPlan}
            createNextGroupPlan={panel.createNextGroupPlan}
            createPlanFromHistory={panel.createPlanFromHistory}
            disbandGroup={panel.disbandGroup}
            focusedPlanId={focusedPlanId}
            focusedProposalId={focusedProposalId}
            group={group}
            inviteCandidates={panel.inviteCandidates}
            inviteMember={panel.inviteMember}
            invitingMemberId={panel.invitingMemberId}
            isDisbanding={panel.isDisbanding}
            isOnline={panel.isOnline}
            isLeaving={panel.isLeaving}
            leaveGroup={panel.leaveGroup}
            members={panel.members}
            pendingPlanAction={panel.pendingPlanAction}
            onEditGroup={() => panel.setIsEditOpen(true)}
            onEditPlan={() => panel.setIsPlanEditOpen(true)}
            removeMember={panel.removeMember}
            removingMemberId={panel.removingMemberId}
            setSelectedMember={panel.setSelectedMember}
          />
        </>
      )}
    </GroupPanelScrollArea>
  );
}

function GroupPanelAdminDialogs({
  group,
  panel,
}: {
  group: Group;
  panel: GroupPanelContentState;
}) {
  const governance = group.governance;
  const isSystemManaged = isSystemManagedGroupGovernance(governance);
  const hasMissingGovernance = hasMissingAutoGovernance({
    forgeMode: group.activity?.forgeMode,
    governance,
  });
  const canEditIdentity = isSystemManaged
    ? governance.capabilities.canEditGroupIdentity
    : !hasMissingGovernance && panel.currentUserRole === "ADMIN";
  const canEditPlan = isSystemManaged
    ? governance.capabilities.canUpdatePlanDirectly
    : !hasMissingGovernance && panel.currentUserRole === "ADMIN";

  if (!canEditIdentity && !canEditPlan) {
    return null;
  }

  return (
    <>
      {canEditIdentity ? (
        <EditGroupIdentityDialog
          group={group}
          open={panel.isEditOpen}
          onOpenChange={panel.setIsEditOpen}
        />
      ) : null}
      {canEditPlan ? (
        <EditPlanDetailsDialog
          group={group}
          open={panel.isPlanEditOpen}
          onOpenChange={panel.setIsPlanEditOpen}
        />
      ) : null}
    </>
  );
}
