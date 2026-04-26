import type { Message } from "@/shared/schemas";
import type { GroupPreview } from "../types/groups.types";
import type { DirectChatPreview } from "../types/direct-chats.types";
import type {
  UnifiedConversation,
  ConversationFilter,
} from "../types/unified-conversation.types";
import type { UnifiedMessage } from "../types/chat.types";

/**
 * Maps a GroupPreview (UI-specific) to a UnifiedConversation
 */
export function groupPreviewToUnified(g: GroupPreview): UnifiedConversation {
  let subtitle = g.lastMessage?.content || "No messages yet";

  if (g.lastMessage) {
    if (g.lastMessage.isSystem) {
      subtitle = g.lastMessage.content;
    } else {
      const prefix = g.lastMessage.sender.fullName
        ? `${g.lastMessage.sender.fullName}: `
        : "";

      let content = g.lastMessage.content;
      if (!content) {
        if (g.lastMessage.type === "VOICE") content = "Voice Note";
        else if (g.lastMessage.type === "IMAGE") content = "Photo";
      }

      subtitle = `${prefix}${content}`;
    }
  }

  return {
    id: g.id,
    kind: "group",
    title: g.name,
    subtitle,
    avatarUrl: g.avatar,
    secondaryAvatar: g.planCoverImage || undefined,
    unreadCount: g.unreadCount,
    isMuted: false,
    isTyping: false,
    lastMessage: g.lastMessage,
    planDateTime: g.planDateTime,
    planStatus: g.planStatus,
    pendingProposals: g.pendingProposals,
  };
}

/**
 * Maps a DirectChatPreview (UI-specific) to a UnifiedConversation
 */
export function dmPreviewToUnified(c: DirectChatPreview): UnifiedConversation {
  let subtitle = c.lastMessage?.content || "No messages yet";

  if (c.isTyping) {
    subtitle = "typing...";
  } else if (c.lastMessage) {
    if (!c.lastMessage.content) {
      if (c.lastMessage.type === "VOICE") subtitle = "Voice Note";
      else if (c.lastMessage.type === "IMAGE") subtitle = "Photo";
    } else {
      subtitle = c.lastMessage.content;
    }
  }

  return {
    id: c.id,
    kind: "dm",
    title: c.participantFullName,
    subtitle,
    avatarUrl: c.participantAvatar,
    unreadCount: c.unreadCount,
    isMuted: c.isMuted,
    isTyping: c.isTyping,
    onlineStatus: c.onlineStatus,
    lastMessage: c.lastMessage
      ? {
          content: c.lastMessage.content,
          createdAt: c.lastMessage.createdAt,
          type: c.lastMessage.type,
          isSystem: false,
          isOwn: c.lastMessage.isOwn,
          status: c.lastMessage.status,
          sender: {
            fullName: c.lastMessage.isOwn ? "Me" : c.participantFullName,
            avatar: c.lastMessage.isOwn ? null : c.participantAvatar,
          },
        }
      : undefined,
  };
}

/**
 * Maps a canonical Message to a UnifiedMessage (UI-ready)
 */
export function messageToUnified(
  m: Message,
  currentUserId: string,
): UnifiedMessage {
  const isOwn = m.senderId === currentUserId;

  return {
    ...m,
    isOwn,
  };
}

/**
 * Sorts conversations by last activity
 */
export function sortByRecency(
  items: UnifiedConversation[],
): UnifiedConversation[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || "0";
    const bTime = b.lastMessage?.createdAt || "0";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

/**
 * Applies filters and search query to conversation list
 */
export function applyFilter(
  items: UnifiedConversation[],
  filter: ConversationFilter,
  query: string,
): UnifiedConversation[] {
  let result = items;

  if (filter === "groups") result = result.filter((i) => i.kind === "group");
  else if (filter === "direct") result = result.filter((i) => i.kind === "dm");
  else if (filter === "unread")
    result = result.filter((i) => i.unreadCount > 0);

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(q)),
    );
  }

  return result;
}
