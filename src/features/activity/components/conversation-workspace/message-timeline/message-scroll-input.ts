import type { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ScrollToMessage } from "./message-scroll.types";
import type { MessageTimelineProps } from "./message-timeline.types";

type ChatScrollInput = Parameters<typeof useChatScroll>[0];

interface MessageTimelineChatScrollInputConfig {
  conversationId: string;
  firstUnreadMessageId: string | null;
  focusedMessageId: string | null;
  layoutVersion: number;
  messages: UnifiedMessage[];
  messagesEndRef: MessageTimelineProps["messagesEndRef"];
  scrollToMessage: ScrollToMessage;
}

export function getChatScrollInput({
  conversationId,
  firstUnreadMessageId,
  focusedMessageId,
  layoutVersion,
  messages,
  messagesEndRef,
  scrollToMessage,
}: MessageTimelineChatScrollInputConfig): ChatScrollInput {
  const latestMessage = getLatestMessage(messages);

  return {
    conversationId,
    initialUnreadMessageId: getInitialUnreadMessageId({
      firstUnreadMessageId,
      focusedMessageId,
    }),
    latestMessageId: getLatestMessageId(latestMessage),
    latestMessageIsOwn: getLatestMessageIsOwn(latestMessage),
    layoutVersion,
    messagesEndRef,
    scrollToInitialUnreadMessage: scrollToMessage,
  };
}

function getLatestMessage(messages: UnifiedMessage[]) {
  return messages[messages.length - 1] ?? null;
}

function getLatestMessageId(message: UnifiedMessage | null) {
  return message ? message.id : null;
}

function getLatestMessageIsOwn(message: UnifiedMessage | null) {
  return message ? message.isOwn : false;
}

function getInitialUnreadMessageId({
  firstUnreadMessageId,
  focusedMessageId,
}: Pick<
  MessageTimelineChatScrollInputConfig,
  "firstUnreadMessageId" | "focusedMessageId"
>) {
  return focusedMessageId ? null : firstUnreadMessageId;
}
