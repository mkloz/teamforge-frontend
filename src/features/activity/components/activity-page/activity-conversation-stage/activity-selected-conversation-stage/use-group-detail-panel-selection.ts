import { useState } from "react";
import type {
  GroupDetailPanelSelection,
  SelectedGroup,
  SelectedGroupMemberProfile,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

export function useGroupDetailPanelSelection(
  activity: ActivityWorkspace,
): GroupDetailPanelSelection {
  const [selectedGroupMemberProfile, setSelectedGroupMemberProfile] =
    useState<SelectedGroupMemberProfile | null>(null);
  const selectedGroupId = activity.selectedGroup?.id ?? null;
  const selectedGroupMemberId = getSelectedGroupMemberId(
    selectedGroupMemberProfile,
    selectedGroupId,
  );

  function openGroupMemberProfile(participant: ActivityParticipant) {
    const selectedGroup = activity.selectedGroup;

    if (!selectedGroup) {
      return;
    }

    const memberId = getGroupParticipantMemberId(selectedGroup, participant);

    if (!memberId) {
      return;
    }

    setSelectedGroupMemberProfile({
      groupId: selectedGroup.id,
      memberId,
    });

    if (!activity.groups.isDetailPanelOpen) {
      activity.toggleGroupDetail();
    }
  }

  function toggleGroupDetailPanel() {
    if (activity.groups.isDetailPanelOpen) {
      setSelectedGroupMemberProfile(null);
    }

    activity.toggleGroupDetail();
  }

  function openCurrentPlanInGroupPanel() {
    const currentPlanId = activity.selectedGroup?.plan?.id;

    if (!currentPlanId) {
      if (!activity.groups.isDetailPanelOpen) {
        activity.toggleGroupDetail();
      }

      return;
    }

    setSelectedGroupMemberProfile(null);
    activity.focusGroupPlan(currentPlanId);
  }

  function closeGroupDetailPanel() {
    setSelectedGroupMemberProfile(null);
    activity.closeGroupDetail();
  }

  function setSelectedGroupMemberId(memberId: string | null) {
    if (!memberId || !selectedGroupId) {
      setSelectedGroupMemberProfile(null);
      return;
    }

    setSelectedGroupMemberProfile({ groupId: selectedGroupId, memberId });
  }

  return {
    closeGroupDetailPanel,
    openCurrentPlanInGroupPanel,
    openGroupMemberProfile,
    selectedGroupMemberId,
    setSelectedGroupMemberId,
    toggleGroupDetailPanel,
  };
}

function getSelectedGroupMemberId(
  selectedGroupMemberProfile: SelectedGroupMemberProfile | null,
  selectedGroupId: string | null,
) {
  return selectedGroupMemberProfile?.groupId === selectedGroupId
    ? selectedGroupMemberProfile.memberId
    : null;
}

function getGroupParticipantMemberId(
  selectedGroup: SelectedGroup,
  participant: ActivityParticipant,
) {
  return (
    selectedGroup.members?.find(
      (groupMember) => groupMember.userId === participant.id,
    )?.userId ?? null
  );
}
