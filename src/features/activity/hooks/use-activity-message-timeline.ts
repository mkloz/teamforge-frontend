import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

interface UseActivityMessageTimelineInput {
  chatId: string | null;
  currentUserId: string | null;
  proposalMessages: UnifiedMessage[];
  selectedKind: "group" | "dm" | null;
  selectedParticipants: ActivityParticipant[];
}

export function useActivityMessageTimeline({
  chatId,
  currentUserId,
  proposalMessages,
  selectedKind,
  selectedParticipants,
}: UseActivityMessageTimelineInput) {
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const messagesQuery = useInfiniteQuery({
    ...ActivityQueryFactory.conversationMessages(chatId ?? "__missing__"),
    enabled:
      !!chatId && selectedParticipants.length > 0 && currentUserId !== null,
  });

  const flattenedApiMessages = ActivityQueryFactory.flattenMessagePages(
    messagesQuery.data,
  );
  const flattenedMessages = ActivityQueryFactory.mapMessages(
    flattenedApiMessages,
    selectedParticipants,
    currentUserId,
  );
  const selectedGroupMessages =
    selectedKind === "group"
      ? ActivityQueryFactory.buildConversationTimeline(
          flattenedMessages,
          proposalMessages,
        )
      : [];
  const selectedDirectMessages = selectedKind === "dm" ? flattenedMessages : [];

  const latestReadableMessageId =
    flattenedMessages[flattenedMessages.length - 1]?.id ?? null;
  const lastMarkedReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId || !latestReadableMessageId || !chatsQuery.data) {
      return;
    }

    const chatSummary = chatsQuery.data.find((chat) => chat.id === chatId);

    if (!chatSummary || (chatSummary.unreadCount ?? 0) === 0) {
      return;
    }

    if (lastMarkedReadRef.current === latestReadableMessageId) {
      return;
    }

    lastMarkedReadRef.current = latestReadableMessageId;
    void ActivityCommands.markChatRead(chatId, latestReadableMessageId);
  }, [chatId, chatsQuery.data, latestReadableMessageId]);

  async function loadOlderMessages() {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      await messagesQuery.fetchNextPage();
    }
  }

  return {
    selectedGroupMessages,
    selectedDirectMessages,
    hasOlderMessages: messagesQuery.hasNextPage,
    isLoadingOlderMessages: messagesQuery.isFetchingNextPage,
    loadOlderMessages,
  };
}
