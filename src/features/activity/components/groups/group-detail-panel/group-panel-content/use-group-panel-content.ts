import { useQuery } from "@tanstack/react-query";
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
import { getPendingSentInvites } from "@/shared/api/invite-membership-api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { Invite } from "@/shared/schemas";

interface UseGroupPanelContentOptions {
  group: Group;
  selectedMemberId?: string | null;
  onSelectedMemberIdChange?: (memberId: string | null) => void;
}

type ActivityFriendshipsData = NonNullable<
  ReturnType<typeof useActivityFriendships>["data"]
>;
type ActivityFriendshipCounterpart =
  ActivityFriendshipsData[number]["counterpart"];

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
    cancelInvitation,
    cancelPlan,
    cancellingInviteId,
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
  const sentInvitationsQuery = useQuery({
    queryKey: APP_QUERY_KEYS.activity.pendingInvitationsByGroup(group.id),
    queryFn: () => getPendingSentInvites(group.id),
    staleTime: 60_000,
  });
  const members = getGroupMembers(group);
  const pendingInvitations = getPendingGroupInvitations(
    sentInvitationsQuery.data,
    group.id,
    group.maxMembers - members.length,
  );
  const selectedMember = getSelectedGroupMember(
    members,
    activeSelectedMemberId,
  );
  const currentUserRole = getCurrentUserRole(members, currentUserId);
  const memberCount = members.length;
  const memberChat = getSelectedMemberChat(selectedMember, group);
  const inviteCandidates = getInviteCandidates(
    friendshipsQuery.data,
    members,
    pendingInvitations,
  );

  function setSelectedMember(member: GroupMember | null) {
    const nextMemberId = member?.userId ?? null;

    if (onSelectedMemberIdChange) {
      onSelectedMemberIdChange(nextMemberId);
      return;
    }

    setLocalSelectedMemberId(nextMemberId);
  }

  return {
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
    pendingInvitations,
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
  pendingInvitations: Invite[],
): ActivityParticipant[] {
  const memberIds = new Set(members.map((member) => member.userId));
  const pendingInviteeIds = new Set(
    pendingInvitations.map((invite) => invite.inviteeId),
  );

  return (friendships ?? [])
    .filter((friendship) => friendship.status === "ACCEPTED")
    .map((friendship) => friendship.counterpart)
    .filter(
      (counterpart) =>
        !memberIds.has(counterpart.id) &&
        !pendingInviteeIds.has(counterpart.id),
    )
    .map(getInviteCandidate);
}

function getPendingGroupInvitations(
  invitations: Invite[] | undefined,
  groupId: string,
  availableSlots: number,
) {
  const currentTime = Date.now();

  return (invitations ?? [])
    .filter(
      (invite) =>
        invite.groupId === groupId &&
        invite.status === "PENDING" &&
        isInvitationUnexpired(invite, currentTime),
    )
    .slice(0, Math.max(0, availableSlots));
}

function isInvitationUnexpired(invite: Invite, currentTime: number) {
  return (
    invite.expiresAt === null || Date.parse(invite.expiresAt) > currentTime
  );
}

function getInviteCandidate(
  counterpart: ActivityFriendshipCounterpart,
): ActivityParticipant {
  return {
    id: counterpart.id,
    name: counterpart.name,
    avatar: counterpart.avatar,
    city: counterpart.city ?? null,
    lastSeenAt: counterpart.lastSeenAt,
    onlineStatus: counterpart.onlineStatus,
  };
}
