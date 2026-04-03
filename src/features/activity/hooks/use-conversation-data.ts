import { useMemo } from "react";
import type { Group } from "../types/groups.types";
import type { DirectChat } from "../types/direct-chats.types";
import { getStatusText, formatTypingText } from "../lib/chat-utils";

interface UseConversationDataProps {
  kind: "dm" | "group";
  data: Group | DirectChat;
  isTyping?: boolean;
  typingUsers?: { name: string; avatar: string }[];
}

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
  const group = isGroup ? (data as Group) : null;
  const chat = !isGroup ? (data as DirectChat) : null;

  const headerProps = useMemo(() => {
    if (isGroup && group) {
      return {
        title: group.identity.name,
        subtitle: `${group.members.length} members`,
        avatarUrl: group.identity.avatar,
        secondaryAvatar: group.plan.coverImage,
      };
    } else if (chat) {
      return {
        title: chat.participant.name,
        subtitle: getStatusText(
          chat.participant.onlineStatus,
          chat.participant.lastSeen,
        ),
        avatarUrl: chat.participant.avatar,
        onlineStatus: chat.participant.onlineStatus,
      };
    }
    return { title: "", avatarUrl: "" };
  }, [isGroup, group, chat]);

  const activeTypingUsers = useMemo(() => {
    if (isGroup) return typingUsers;
    if (isTyping && chat) {
      return [{ name: chat.participant.name, avatar: chat.participant.avatar }];
    }
    return [];
  }, [isGroup, typingUsers, isTyping, chat]);

  const typingText = useMemo(
    () => formatTypingText(activeTypingUsers, isGroup),
    [activeTypingUsers, isGroup],
  );

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
