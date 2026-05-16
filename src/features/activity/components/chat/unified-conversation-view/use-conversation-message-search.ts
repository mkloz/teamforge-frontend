import { useQuery } from "@tanstack/react-query";
import { type RefObject, useEffect, useMemo, useState } from "react";

import { ActivityApi } from "@/features/activity/api/activity.api";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import type { MessageScrollHandle } from "./unified-message-list/message-scroll.types";

interface UseConversationMessageSearchInput {
  chatId: string | null;
  hasOlderMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  messages: UnifiedMessage[];
  messageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  query: string;
}

const SEARCH_RESULT_LIMIT = 100;

function normalizeSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase();
}

export function useConversationMessageSearch({
  chatId,
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  messages,
  messageScrollHandleRef,
  onLoadOlderMessages,
  query,
}: UseConversationMessageSearchInput) {
  const normalizedQuery = normalizeSearchQuery(query);
  const debouncedQuery = useDebouncedValue(normalizedQuery, 250);
  const messageSearchQuery = useQuery({
    queryKey: APP_QUERY_KEYS.activity.messageSearch(
      chatId ?? "__missing__",
      debouncedQuery,
    ),
    queryFn: () => {
      if (!chatId) {
        throw new Error("Cannot search messages without a chat id.");
      }

      return ActivityApi.searchChatMessages(chatId, {
        limit: SEARCH_RESULT_LIMIT,
        query: debouncedQuery,
      });
    },
    enabled: Boolean(chatId && debouncedQuery),
    retry: false,
    staleTime: 15_000,
  });

  const localMatchIds = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return messages
      .filter((message) =>
        message.content.toLocaleLowerCase().includes(normalizedQuery),
      )
      .map((message) => message.id);
  }, [messages, normalizedQuery]);

  const remoteMatchIds = useMemo(() => {
    const remoteItems = messageSearchQuery.data?.items;

    if (!Array.isArray(remoteItems) || debouncedQuery !== normalizedQuery) {
      return null;
    }

    return remoteItems.map((message) => message.id).reverse();
  }, [debouncedQuery, messageSearchQuery.data, normalizedQuery]);

  const searchMatchIds = remoteMatchIds ?? localMatchIds;
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const activeMatchId = searchMatchIds[activeMatchIndex] ?? null;

  useEffect(() => {
    const hasActiveQuery = normalizedQuery.length > 0;

    setActiveMatchIndex(
      hasActiveQuery && searchMatchIds.length > 0
        ? searchMatchIds.length - 1
        : 0,
    );
  }, [normalizedQuery, searchMatchIds.length]);

  useEffect(() => {
    if (!activeMatchId) {
      return undefined;
    }

    const isActiveMatchLoaded = messages.some(
      (message) => message.id === activeMatchId,
    );

    if (!isActiveMatchLoaded) {
      if (hasOlderMessages && !isLoadingOlderMessages && onLoadOlderMessages) {
        void onLoadOlderMessages();
      }

      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      messageScrollHandleRef.current?.scrollToMessage(activeMatchId, {
        highlight: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    activeMatchId,
    hasOlderMessages,
    isLoadingOlderMessages,
    messageScrollHandleRef,
    messages,
    onLoadOlderMessages,
  ]);

  function goToNextMatch() {
    if (searchMatchIds.length === 0) {
      return;
    }

    setActiveMatchIndex((current) => (current + 1) % searchMatchIds.length);
  }

  function goToPreviousMatch() {
    if (searchMatchIds.length === 0) {
      return;
    }

    setActiveMatchIndex(
      (current) =>
        (current - 1 + searchMatchIds.length) % searchMatchIds.length,
    );
  }

  return {
    activeMatchId,
    activeMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    isSearching:
      normalizedQuery.length > 0 &&
      (debouncedQuery !== normalizedQuery || messageSearchQuery.isFetching),
    matchCount: searchMatchIds.length,
    normalizedQuery,
  };
}
