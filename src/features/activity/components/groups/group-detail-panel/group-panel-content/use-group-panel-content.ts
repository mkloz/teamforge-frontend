import { useMemo, useState } from "react";

import { useActivityFriendships } from "@/features/activity/hooks/use-activity-friendships";
import { useActivityGroupActions } from "@/features/activity/hooks/use-activity-group-actions";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import type {
  DirectChat,
  Group,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildMemberProfileChat } from "@/features/activity/lib/activity-projections";

interface UseGroupPanelContentOptions {
  group: Group;
  isMobile: boolean;
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
}

export function useGroupPanelContent({
  group,
  isMobile,
  onClose,
  onJumpToMessage,
}: UseGroupPanelContentOptions) {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const {
    cancelPlan,
    completePlan,
    confirmPlan,
    currentUserId,
    createNextGroupPlan,
    disbandGroup,
    inviteMember,
    isDisbanding,
    isLeaving,
    invitingMemberId,
    leaveGroup,
    pendingPlanAction,
    removeMember,
    removingMemberId,
  } = useActivityGroupActions(group.id);
  const { unpinMessage } = useActivityMessageActions();
  const friendshipsQuery = useActivityFriendships();

  const currentUserRole: MemberRole = useMemo(() => {
    const currentMember = group.members?.find(
      (member: GroupMember) =>
        member.userId === currentUserId && member.leftAt === null,
    );

    return currentMember?.role ?? "MEMBER";
  }, [currentUserId, group.members]);
  const members = useMemo(() => group.members ?? [], [group.members]);
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

  function jumpToPinnedMessage(messageId: string) {
    const scroll = () => onJumpToMessage?.(messageId);

    if (isMobile) {
      onClose();
      setTimeout(scroll, 220);
      return;
    }

    scroll();
  }

  return {
    currentUserId,
    currentUserRole,
    cancelPlan,
    completePlan,
    confirmPlan,
    createNextGroupPlan,
    disbandGroup,
    inviteCandidates,
    inviteMember,
    invitingMemberId,
    isDisbanding,
    isEditOpen,
    isLeaving,
    isPlanEditOpen,
    jumpToPinnedMessage,
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
    unpinMessage,
  };
}
