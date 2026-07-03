import type { ChatApi, MessageApi } from "@/shared/schemas";

export interface ActivityGroupChatState {
  lastActivityByGroupId: Map<string, string>;
  messagePreviewsByGroupId: Map<string, string>;
  statusesByGroupId: Map<string, ActivityGroupChatStatus>;
  unreadCountsByGroupId: Map<string, number>;
}

export interface ActivityGroupChatStatus {
  isMuted: boolean;
  isPinned: boolean;
}

const MESSAGE_TYPE_PREVIEWS: Record<MessageApi["type"], string> = {
  FILE: "File",
  IMAGE: "Photo",
  PLAN_UPDATE: "Plan update",
  SYSTEM: "Group update",
  TEXT: "New message",
  VOICE: "Voice note",
};

export function collectActivityGroupChatState(
  chats: ChatApi[],
): ActivityGroupChatState {
  const lastActivityByGroupId = new Map<string, string>();
  const messagePreviewsByGroupId = new Map<string, string>();
  const statusesByGroupId = new Map<string, ActivityGroupChatStatus>();
  const unreadCountsByGroupId = new Map<string, number>();

  for (const chat of chats) {
    if (!isGroupChat(chat)) {
      continue;
    }

    unreadCountsByGroupId.set(chat.groupId, getUnreadCount(chat));
    statusesByGroupId.set(chat.groupId, getGroupChatStatus(chat));
    setLastActivity(lastActivityByGroupId, chat);
    setMessagePreview(messagePreviewsByGroupId, chat);
  }

  return {
    lastActivityByGroupId,
    messagePreviewsByGroupId,
    statusesByGroupId,
    unreadCountsByGroupId,
  };
}

function isGroupChat(chat: ChatApi): chat is ChatApi & { groupId: string } {
  return chat.type === "GROUP" && Boolean(chat.groupId);
}

function getUnreadCount(chat: ChatApi) {
  return chat.unreadCount ?? (chat.hasUnread ? 1 : 0);
}

function getGroupChatStatus(chat: ChatApi): ActivityGroupChatStatus {
  return {
    isMuted: chat.isMuted,
    isPinned: chat.isPinned,
  };
}

function setLastActivity(
  lastActivityByGroupId: Map<string, string>,
  chat: ChatApi & { groupId: string },
) {
  if (chat.lastMessage?.createdAt) {
    lastActivityByGroupId.set(chat.groupId, chat.lastMessage.createdAt);
  }
}

function setMessagePreview(
  messagePreviewsByGroupId: Map<string, string>,
  chat: ChatApi & { groupId: string },
) {
  const messagePreview = getMessagePreview(chat);

  if (messagePreview) {
    messagePreviewsByGroupId.set(chat.groupId, messagePreview);
  }
}

function getMessagePreview(chat: ChatApi) {
  const message = chat.lastMessage;

  if (!canPreviewMessage(message)) {
    return null;
  }

  const content = getCompactMessagePreviewContent(message);

  if (message.type === "PLAN_UPDATE") {
    return content;
  }

  return getSenderPrefixedPreview(message, content);
}

function canPreviewMessage(
  message: ChatApi["lastMessage"],
): message is MessageApi {
  return Boolean(message && message.type !== "SYSTEM");
}

function getCompactMessagePreviewContent(message: MessageApi) {
  return compactPreview(
    message.content.trim() || getMessageTypePreview(message.type),
  );
}

function getSenderPrefixedPreview(message: MessageApi, content: string) {
  if (!message.sender?.name) {
    return content;
  }

  return `${message.sender.name}: ${content}`;
}

function compactPreview(value: string) {
  return value.length > 72 ? `${value.slice(0, 69).trimEnd()}...` : value;
}

function getMessageTypePreview(type: MessageApi["type"]) {
  return MESSAGE_TYPE_PREVIEWS[type] ?? "New message";
}
