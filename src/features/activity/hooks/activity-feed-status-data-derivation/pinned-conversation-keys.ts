import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { ChatApi } from "@/shared/schemas";

export function getPinnedConversationKeys(chats: ChatApi[]) {
  const notesKey = getNotesConversationKey(chats);
  const pinnedKeys = chats.flatMap(getPinnedConversationKey);

  return [...pinnedKeys].sort(
    createNotesFirstPinnedConversationComparator(notesKey),
  );
}

function getNotesConversationKey(chats: ChatApi[]) {
  const notesChat = chats.find(isNotesChat);

  return notesChat ? getActivityConversationKey("dm", notesChat.id) : null;
}

function isNotesChat(chat: ChatApi) {
  return chat.type === "NOTES";
}

function getPinnedConversationKey(chat: ChatApi) {
  if (!chat.isPinned) {
    return [];
  }

  if (chat.type === "GROUP") {
    return chat.groupId
      ? [getActivityConversationKey("group", chat.groupId)]
      : [];
  }

  return [getActivityConversationKey("dm", chat.id)];
}

function createNotesFirstPinnedConversationComparator(notesKey: string | null) {
  if (!notesKey) {
    return () => 0;
  }

  return (left: string, right: string) =>
    getPinnedConversationSortRank(left, notesKey) -
    getPinnedConversationSortRank(right, notesKey);
}

function getPinnedConversationSortRank(key: string, notesKey: string) {
  return key === notesKey ? 0 : 1;
}
