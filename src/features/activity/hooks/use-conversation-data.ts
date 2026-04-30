import { useMemo } from "react";
import { getOtherChatParticipant } from "../lib/activity-projections";
import type { DirectChat, Group } from "../lib/activity-contract";
import { getStatusText, formatTypingText } from "../lib/chat-utils";

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

  const participant = useMemo(() => {
    if (isGroup || !chat) return null;
    return getOtherChatParticipant(chat);
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
  }, [isGroup, group, chat, participant]);

  const activeTypingUsers = useMemo(() => {
    if (isGroup) return typingUsers;
    if (isTyping && participant) {
      return [{ name: participant.name, avatar: participant.avatar ?? null }];
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
