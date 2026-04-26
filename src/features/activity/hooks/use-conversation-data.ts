import { useMemo } from "react";
import type { Group } from "../types/groups.types";
import type { DirectChat } from "../types/direct-chats.types";
import { getStatusText, formatTypingText } from "../lib/chat-utils";
import { CURRENT_USER_ID } from "../data/mock-direct-chats";

interface UseConversationDataProps {
  kind: "dm" | "group";
  data: Group | DirectChat;
  isTyping?: boolean;
  typingUsers?: { fullName: string; avatar: string }[];
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

  const participant = useMemo(() => {
    if (isGroup || !chat) return null;
    const pData = chat.participants?.find((p) => p.userId !== CURRENT_USER_ID);
    return pData?.user;
  }, [isGroup, chat]);

  const headerProps = useMemo(() => {
    if (isGroup && group) {
      return {
        title: group.name,
        subtitle: `${group.members?.length || 0} members`,
        avatarUrl: group.avatar,
        secondaryAvatar: group.plan?.coverImage,
      };
    } else if (chat && participant) {
      return {
        title: participant.fullName,
        subtitle: getStatusText(
          participant.onlineStatus || "OFFLINE",
          undefined, // lastSeen not in schema yet
        ),
        avatarUrl: participant.avatar,
        onlineStatus: participant.onlineStatus,
      };
    }
    return { title: "", avatarUrl: "" };
  }, [isGroup, group, chat, participant]);

  const activeTypingUsers = useMemo(() => {
    if (isGroup) return typingUsers;
    if (isTyping && participant) {
      return [
        { fullName: participant.fullName, avatar: participant.avatar || "" },
      ];
    }
    return [];
  }, [isGroup, typingUsers, isTyping, participant]);

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
