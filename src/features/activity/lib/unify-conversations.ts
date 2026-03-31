import type { GroupPreview, Message } from "../types/groups.types";
import type {
  DirectChatPreview,
  DirectMessage,
} from "../types/direct-chats.types";
import type {
  UnifiedConversation,
  FilterChip,
} from "../types/unified-conversation.types";
import type { UnifiedMessage } from "../types/chat.types";

export function groupPreviewToUnified(g: GroupPreview): UnifiedConversation {
  let subtitleIcon: UnifiedConversation["subtitleIcon"];
  let subtitle = g.lastMessage?.content || "No messages yet";

  if (g.lastMessage) {
    if (g.lastMessage.isSystem) {
      subtitle = g.lastMessage.content;
    } else {
      const prefix = g.lastMessage.senderName
        ? `${g.lastMessage.senderName}: `
        : "";

      let content = g.lastMessage.content;
      if (!content) {
        if (g.lastMessage.type === "VOICE") {
          content = "Voice Note";
          subtitleIcon = "voice";
        } else if (g.lastMessage.type === "IMAGE") {
          content = "Photo";
          subtitleIcon = "image";
        } else if (g.lastMessage.type === "PLAN_UPDATE") {
          content = "Proposal";
          subtitleIcon = "proposal";
        }
      }

      subtitle = `${prefix}${content}`;
    }
  }

  return {
    id: g.id,
    kind: "group",
    title: g.groupName,
    subtitle,
    subtitleIcon,
    avatarUrl: g.groupAvatar,
    timestamp: g.lastMessage?.timestamp ?? g.planDateTime,
    unreadCount: g.unreadCount,
    lastMessageIsSystem: g.lastMessage?.isSystem,
    // Group-specific
    memberCount: g.memberCount,
    memberAvatars: g.memberAvatars,
    planCoverImage: g.planCoverImage,
    planDateTime: g.planDateTime,
    planStatus: g.planStatus,
    groupStatus: g.status,
    pendingProposals: g.pendingProposals,
    senderName: g.lastMessage?.senderName,
  };
}

export function dmPreviewToUnified(c: DirectChatPreview): UnifiedConversation {
  let subtitleIcon: UnifiedConversation["subtitleIcon"];
  let subtitle = c.lastMessage?.content || "No messages yet";

  if (c.isTyping) {
    subtitle = "typing...";
  } else if (c.lastMessage) {
    if (!c.lastMessage.content) {
      if (c.lastMessage.type === "VOICE") {
        subtitle = "Voice Note";
        subtitleIcon = "voice";
      } else if (c.lastMessage.type === "IMAGE") {
        subtitle = "Photo";
        subtitleIcon = "image";
      }
    } else {
      subtitle = c.lastMessage.content;
    }
  }

  return {
    id: c.id,
    kind: "dm",
    title: c.participantName,
    subtitle,
    subtitleIcon,
    avatarUrl: c.participantAvatar,
    timestamp: c.lastMessage?.timestamp ?? new Date(0).toISOString(),
    unreadCount: c.unreadCount,
    lastMessageIsOwn: c.lastMessage?.isOwn,
    lastMessageStatus: c.lastMessage?.status,
    // DM-specific
    onlineStatus: c.onlineStatus,
    isTyping: c.isTyping,
    isMuted: c.isMuted,
  };
}

export function groupMessageToUnified(m: Message): UnifiedMessage {
  return {
    id: m.id,
    type: m.type,
    content: m.content,
    senderId: m.senderId,
    senderName: m.senderName,
    senderAvatar: m.senderAvatar,
    timestamp: m.timestamp,
    isOwn: m.isOwn,
    status: m.status || "READ",
    readBy: m.readBy,
    chatId: m.groupId,
    // Pass through new features
    attachments: m.attachments,
    reactions: m.reactions,
    replyTo: m.replyTo,
    isEdited: m.isEdited,
    isPinned: m.isPinned,
  };
}

export function dmMessageToUnified(
  m: DirectMessage,
  participantName: string,
  participantAvatar: string,
): UnifiedMessage {
  return {
    id: m.id,
    type: m.type,
    content: m.content,
    senderId: m.senderId,
    senderName: m.isOwn ? "Me" : participantName,
    senderAvatar: m.isOwn ? "" : participantAvatar,
    timestamp: m.timestamp,
    isOwn: m.isOwn,
    status: m.status,
    chatId: m.chatId,
    // Pass through new features
    attachments: m.attachments,
    reactions: m.reactions,
    replyTo: m.replyTo,
    isEdited: m.isEdited,
    isPinned: m.isPinned,
  };
}

export function sortByRecency(
  items: UnifiedConversation[],
): UnifiedConversation[] {
  return [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function applyFilter(
  items: UnifiedConversation[],
  filter: FilterChip,
  query: string,
): UnifiedConversation[] {
  let result = items;

  if (filter === "groups") result = result.filter((i) => i.kind === "group");
  else if (filter === "dms") result = result.filter((i) => i.kind === "dm");
  else if (filter === "unread")
    result = result.filter((i) => i.unreadCount > 0);

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q),
    );
  }

  return result;
}
