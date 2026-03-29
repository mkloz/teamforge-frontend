import type { GroupPreview } from "@/features/groups/types/groups.types";
import type { DirectChatPreview } from "@/features/direct-chats/types/direct-chats.types";
import type {
  UnifiedConversation,
  FilterChip,
} from "../types/unified-conversation.types";

export function groupPreviewToUnified(g: GroupPreview): UnifiedConversation {
  return {
    id: g.id,
    kind: "group",
    title: g.groupName,
    subtitle: g.lastMessage
      ? g.lastMessage.isSystem
        ? g.lastMessage.content
        : `${g.lastMessage.senderName}: ${g.lastMessage.content}`
      : "No messages yet",
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
  return {
    id: c.id,
    kind: "dm",
    title: c.participantName,
    subtitle: c.isTyping
      ? "typing..."
      : (c.lastMessage?.content ?? "No messages yet"),
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
