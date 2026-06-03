import { useMemo, useState } from "react";

import { useActivityFriendships } from "@/features/activity/hooks/use-activity-friendships";
import { useActivityGroupActions } from "@/features/activity/hooks/use-activity-group-actions";
import type {
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
  const members = useMemo(() => group.members ?? [], [group.members]);
  const selectedMember = useMemo(
    () =>
      members.find((member) => member.userId === activeSelectedMemberId) ??
      null,
    [activeSelectedMemberId, members],
  );

  const currentUserRole: MemberRole = useMemo(() => {
    const currentMember = group.members?.find(
      (member: GroupMember) =>
        member.userId === currentUserId && member.leftAt === null,
    );

    return currentMember?.role ?? "MEMBER";
  }, [currentUserId, group.members]);
  const memberCount = members.length;

  const memberChat: DirectChat | null = useMemo(() => {
    return buildMemberProfileChat(selectedMember, group);
  }, [selectedMember, group]);

  const inviteCandidates = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));

    return (friendshipsQuery.data ?? [])
      .filter((friendship) => friendship.status === "ACCEPTED")
      .map((friendship) => friendship.counterpart)
      .filter((counterpart) => !memberIds.has(counterpart.id))
      .map((counterpart) => ({
        id: counterpart.id,
        name: counterpart.name,
        avatar: counterpart.avatar,
        city: counterpart.city ?? null,
        personalityType: counterpart.personalityType,
        onlineStatus: counterpart.onlineStatus,
        trustScore:
          counterpart.trustScore > 0 && counterpart.trustScore <= 1
            ? Math.round(counterpart.trustScore * 100)
            : Math.round(counterpart.trustScore),
      }));
  }, [friendshipsQuery.data, members]);

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
