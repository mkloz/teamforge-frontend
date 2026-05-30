import type { ChatApi, MessageApi } from "@/shared/schemas";

export interface GroupChatState {
  lastActivityByGroupId: Map<string, string>;
  messagePreviewsByGroupId: Map<string, string>;
  statusesByGroupId: Map<string, GroupChatStatus>;
  unreadCountsByGroupId: Map<string, number>;
}

export interface GroupChatStatus {
  isMuted: boolean;
  isPinned: boolean;
}

export function collectGroupChatState(chats: ChatApi[]): GroupChatState {
  const lastActivityByGroupId = new Map<string, string>();
  const messagePreviewsByGroupId = new Map<string, string>();
  const statusesByGroupId = new Map<string, GroupChatStatus>();
  const unreadCountsByGroupId = new Map<string, number>();

  for (const chat of chats) {
    if (chat.type !== "GROUP" || !chat.groupId) {
      continue;
    }

    const unreadCount = chat.unreadCount ?? (chat.hasUnread ? 1 : 0);

    unreadCountsByGroupId.set(chat.groupId, unreadCount);
    statusesByGroupId.set(chat.groupId, {
      isMuted: chat.isMuted,
      isPinned: chat.isPinned,
    });

    if (chat.lastMessage?.createdAt) {
      lastActivityByGroupId.set(chat.groupId, chat.lastMessage.createdAt);
    }

    const messagePreview = getMessagePreview(chat);

    if (messagePreview) {
      messagePreviewsByGroupId.set(chat.groupId, messagePreview);
    }
  }

  return {
    lastActivityByGroupId,
    messagePreviewsByGroupId,
    statusesByGroupId,
    unreadCountsByGroupId,
  };
}

function getMessagePreview(chat: ChatApi) {
  const message = chat.lastMessage;

  if (!message) {
    return null;
  }

  if (message.type === "SYSTEM") {
    return null;
  }

  const content = compactPreview(
    message.content.trim() || getMessageTypePreview(message.type),
  );

  if (message.type === "PLAN_UPDATE") {
    return content;
  }

  return message.sender?.name ? `${message.sender.name}: ${content}` : content;
}

function compactPreview(value: string) {
  return value.length > 72 ? `${value.slice(0, 69).trimEnd()}...` : value;
}

function getMessageTypePreview(type: MessageApi["type"]) {
  if (type === "IMAGE") {
    return "Photo";
  }

  if (type === "VOICE") {
    return "Voice note";
  }

  if (type === "FILE") {
    return "File";
  }

  if (type === "PLAN_UPDATE") {
    return "Plan update";
  }

  if (type === "SYSTEM") {
    return "Group update";
  }

  return "New message";
}
