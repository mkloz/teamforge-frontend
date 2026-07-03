import type {
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import {
  getConversationIsNotes,
  getConversationSubtitle,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import type { ConversationContentState } from "./types";

export function getConversationContentState({
  isSavedView,
  item,
}: {
  isSavedView: boolean;
  item: UnifiedConversation;
}): ConversationContentState {
  const previewMessage = getPreviewMessage(item, isSavedView);
  const timestampMessage = getTimestampMessage({
    isSavedView,
    item,
    previewMessage,
  });

  return {
    formattedTimestamp: timestampMessage?.createdAt
      ? formatRelativeTime(timestampMessage.createdAt)
      : "",
    isNotes: getConversationIsNotes(item),
    latestMessage: item.latestMessage,
    previewMessage,
    subtitle: getSubtitle(item, isSavedView),
    title: getConversationTitle(item),
  };
}

function getPreviewMessage(
  item: UnifiedConversation,
  isSavedView: boolean,
): UnifiedMessage | undefined {
  if (isSavedView && item.latestSavedMessage) {
    return item.latestSavedMessage;
  }

  return item.latestMessage;
}

function getSubtitle(item: UnifiedConversation, isSavedView: boolean): string {
  if (isSavedView && item.latestSavedMessage) {
    return getMessagePreviewText(item.latestSavedMessage);
  }

  return getConversationSubtitle(item);
}

function getTimestampMessage({
  isSavedView,
  item,
  previewMessage,
}: {
  isSavedView: boolean;
  item: UnifiedConversation;
  previewMessage: UnifiedMessage | undefined;
}): UnifiedMessage | undefined {
  return isSavedView ? previewMessage : item.latestMessage;
}
