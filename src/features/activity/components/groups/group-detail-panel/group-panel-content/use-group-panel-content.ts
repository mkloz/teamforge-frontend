import { useState } from "react";

import { useActivityFriendships } from "@/features/activity/hooks/use-activity-friendships";
import { useActivityGroupActions } from "@/features/activity/hooks/use-activity-group-actions";
import type {
  ActivityParticipant,
  DirectChat,
  Group,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildMemberProfileChat } from "@/features/activity/lib/activity-projections";

interface UseGroupPanelContentOptions {
  group: Group;
  selectedMemberId?: string | null;
  onSelectedMemberIdChange?: (memberId: string | null) => void;
}

type ActivityFriendshipsData = NonNullable<
  ReturnType<typeof useActivityFriendships>["data"]
>;

export function useGroupPanelContent({
  group,
  selectedMemberId = null,
  onSelectedMemberIdChange,
}: UseGroupPanelContentOptions) {
  const [localSelectedMemberId, setLocalSelectedMemberId] = useState<
    string | null
  >(null);
  const activeSelectedMemberId =
    onSelectedMemberIdChange === undefined
      ? localSelectedMemberId
      : selectedMemberId;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const {
    cancelPlan,
    completePlan,
    confirmPlan,
    currentUserId,
    createNextGroupPlan,
    createPlanFromHistory,
    disbandGroup,
    inviteMember,
    isDisbanding,
    isOnline,
    isLeaving,
    invitingMemberId,
    leaveGroup,
    pendingPlanAction,
    removeMember,
    removingMemberId,
  } = useActivityGroupActions(group.id);
  const friendshipsQuery = useActivityFriendships();
  const members = getGroupMembers(group);
  const selectedMember = getSelectedGroupMember(
    members,
    activeSelectedMemberId,
  );
  const currentUserRole = getCurrentUserRole(members, currentUserId);
  const memberCount = members.length;
  const memberChat = getSelectedMemberChat(selectedMember, group);
  const inviteCandidates = getInviteCandidates(friendshipsQuery.data, members);

  function setSelectedMember(member: GroupMember | null) {
    const nextMemberId = member?.userId ?? null;

    if (onSelectedMemberIdChange) {
      onSelectedMemberIdChange(nextMemberId);
      return;
    }

    setLocalSelectedMemberId(nextMemberId);
  }

  return {
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
  };
}

function getGroupMembers(group: Group) {
  return group.members ?? [];
}

function getSelectedGroupMember(
  members: GroupMember[],
  activeSelectedMemberId: string | null,
) {
  return (
    members.find((member) => member.userId === activeSelectedMemberId) ?? null
  );
}

function getCurrentUserRole(
  members: GroupMember[],
  currentUserId: string | null,
): MemberRole {
  const currentMember = members.find(
    (member) => member.userId === currentUserId && member.leftAt === null,
  );

  return currentMember?.role ?? "MEMBER";
}

function getSelectedMemberChat(
  selectedMember: GroupMember | null,
  group: Group,
): DirectChat | null {
  return buildMemberProfileChat(selectedMember, group);
}

function getInviteCandidates(
  friendships: ActivityFriendshipsData | undefined,
  members: GroupMember[],
): ActivityParticipant[] {
  const memberIds = new Set(members.map((member) => member.userId));

  return (friendships ?? [])
    .filter((friendship) => friendship.status === "ACCEPTED")
    .map((friendship) => friendship.counterpart)
    .filter((counterpart) => !memberIds.has(counterpart.id))
    .map(getInviteCandidate);
}

function getInviteCandidate(counterpart: ActivityParticipant) {
  return {
    id: counterpart.id,
    name: counterpart.name,
    avatar: counterpart.avatar,
    city: counterpart.city ?? null,
    personalityType: counterpart.personalityType,
    onlineStatus: counterpart.onlineStatus,
    trustScore: getDisplayTrustScore(counterpart.trustScore),
  };
}

function getDisplayTrustScore(trustScore: number) {
  return trustScore > 0 && trustScore <= 1
    ? Math.round(trustScore * 100)
    : Math.round(trustScore);
}
