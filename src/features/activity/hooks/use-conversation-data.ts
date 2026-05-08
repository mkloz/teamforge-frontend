import type {
  DirectChat,
  Group,
} from "@/features/activity/lib/activity-contract";
import { getOtherChatParticipant } from "@/features/activity/lib/activity-projections";
import {
  formatTypingText,
  getStatusText,
} from "@/features/activity/lib/chat-utils";

interface BaseProps {
  isTyping?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
}

export type UseConversationDataProps =
  | (BaseProps & { kind: "dm"; data: DirectChat })
  | (BaseProps & { kind: "group"; data: Group });

/**
 * useConversationData - Derives header props and active typing state based on conversation type.
 */
export function useConversationData({
  kind,
  data,
  isTyping,
  typingUsers = [],
}: UseConversationDataProps) {
  const isGroup = kind === "group";
  const group = isGroup ? data : null;
  const chat = !isGroup ? data : null;

  const participant = isGroup || !chat ? null : getOtherChatParticipant(chat);

  const headerProps = getConversationHeaderProps({
    chat,
    group,
    isGroup,
    participant,
  });

  const activeTypingUsers = getActiveTypingUsers({
    isGroup,
    isTyping,
    participant,
    typingUsers,
  });
  const typingText = formatTypingText(activeTypingUsers, isGroup);

  return {
    isGroup,
    group,
    chat,
    headerProps,
    activeTypingUsers,
    typingText,
    isCompleted: isGroup && group?.status === "COMPLETED",
  };
}

interface ConversationHeaderPropsInput {
  chat: DirectChat | null;
  group: Group | null;
  isGroup: boolean;
  participant: ReturnType<typeof getOtherChatParticipant> | null;
}

function getConversationHeaderProps({
  chat,
  group,
  isGroup,
  participant,
}: ConversationHeaderPropsInput) {
  if (isGroup && group) {
    return {
      title: group.name,
      subtitle: `${group.members?.length || 0} members`,
      avatarUrl: group.avatar,
      secondaryAvatar: group.plan?.coverImage,
    };
  }

  if (chat && participant) {
    return {
      title: participant.name,
      subtitle: getStatusText(
        participant.onlineStatus || "OFFLINE",
        undefined, // lastSeen not in schema yet
      ),
      avatarUrl: participant.avatar,
      onlineStatus: participant.onlineStatus,
    };
  }

  return { title: "", avatarUrl: "" };
}

interface ActiveTypingUsersInput {
  isGroup: boolean;
  isTyping?: boolean;
  participant: ReturnType<typeof getOtherChatParticipant> | null;
  typingUsers: { name: string; avatar: string | null }[];
}

function getActiveTypingUsers({
  isGroup,
  isTyping,
  participant,
  typingUsers,
}: ActiveTypingUsersInput) {
  if (isGroup) return typingUsers;
  if (isTyping && participant) {
    return [{ name: participant.name, avatar: participant.avatar ?? null }];
  }
  return [];
}
