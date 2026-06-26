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

type MessageSearchResult = Awaited<
  ReturnType<typeof ActivityApi.searchChatMessages>
>;

interface RemoteSearchMatchInput {
  debouncedQuery: string;
  normalizedQuery: string;
  searchData: MessageSearchResult | undefined;
}

interface SearchMatchNavigationInput {
  normalizedQuery: string;
  searchMatchIds: string[];
}

interface InitialMatchIndexInput {
  hasActiveQuery: boolean;
  matchCount: number;
}

interface ActiveSearchMatchScrollInput
  extends Pick<
    UseConversationMessageSearchInput,
    | "hasOlderMessages"
    | "isLoadingOlderMessages"
    | "messageScrollHandleRef"
    | "messages"
    | "onLoadOlderMessages"
  > {
  activeMatchId: string | null;
}

type ActiveSearchMatchScrollAction =
  | { kind: "idle" }
  | {
      kind: "load";
      onLoadOlderMessages: NonNullable<
        UseConversationMessageSearchInput["onLoadOlderMessages"]
      >;
    }
  | {
      kind: "scroll";
      messageId: string;
      messageScrollHandleRef: UseConversationMessageSearchInput["messageScrollHandleRef"];
    };

interface SearchInFlightInput {
  debouncedQuery: string;
  isFetching: boolean;
  normalizedQuery: string;
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

  const localMatchIds = useMemo(
    () => getLocalSearchMatchIds(messages, normalizedQuery),
    [messages, normalizedQuery],
  );

  const remoteMatchIds = useMemo(
    () =>
      getRemoteSearchMatchIds({
        debouncedQuery,
        normalizedQuery,
        searchData: messageSearchQuery.data,
      }),
    [debouncedQuery, messageSearchQuery.data, normalizedQuery],
  );

  const searchMatchIds = remoteMatchIds ?? localMatchIds;
  const { activeMatchId, activeMatchIndex, goToNextMatch, goToPreviousMatch } =
    useSearchMatchNavigation({
      normalizedQuery,
      searchMatchIds,
    });

  useActiveSearchMatchScroll({
    activeMatchId,
    hasOlderMessages,
    isLoadingOlderMessages,
    messageScrollHandleRef,
    messages,
    onLoadOlderMessages,
  });

  return {
    activeMatchId,
    activeMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    isSearching: getIsSearchInFlight({
      debouncedQuery,
      isFetching: messageSearchQuery.isFetching,
      normalizedQuery,
    }),
    matchCount: searchMatchIds.length,
    normalizedQuery,
  };
}

function getLocalSearchMatchIds(
  messages: UnifiedMessage[],
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return [];
  }

  return messages
    .filter((message) =>
      message.content.toLocaleLowerCase().includes(normalizedQuery),
    )
    .map((message) => message.id);
}

function getRemoteSearchMatchIds({
  debouncedQuery,
  normalizedQuery,
  searchData,
}: RemoteSearchMatchInput) {
  const remoteItems = searchData?.items;

  if (!Array.isArray(remoteItems) || debouncedQuery !== normalizedQuery) {
    return null;
  }

  return remoteItems.map((message) => message.id).reverse();
}

function useSearchMatchNavigation({
  normalizedQuery,
  searchMatchIds,
}: SearchMatchNavigationInput) {
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const activeMatchId = searchMatchIds[activeMatchIndex] ?? null;

  useEffect(() => {
    setActiveMatchIndex(
      getInitialMatchIndex({
        hasActiveQuery: normalizedQuery.length > 0,
        matchCount: searchMatchIds.length,
      }),
    );
  }, [normalizedQuery, searchMatchIds.length]);

  function goToNextMatch() {
    if (searchMatchIds.length === 0) {
      return;
    }

    setActiveMatchIndex((current) =>
      getNextMatchIndex(current, searchMatchIds.length),
    );
  }

  function goToPreviousMatch() {
    if (searchMatchIds.length === 0) {
      return;
    }

    setActiveMatchIndex((current) =>
      getPreviousMatchIndex(current, searchMatchIds.length),
    );
  }

  return {
    activeMatchId,
    activeMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
  };
}

function getInitialMatchIndex({
  hasActiveQuery,
  matchCount,
}: InitialMatchIndexInput) {
  return hasActiveQuery && matchCount > 0 ? matchCount - 1 : 0;
}

function getNextMatchIndex(currentIndex: number, matchCount: number) {
  return (currentIndex + 1) % matchCount;
}

function getPreviousMatchIndex(currentIndex: number, matchCount: number) {
  return (currentIndex - 1 + matchCount) % matchCount;
}

function useActiveSearchMatchScroll({
  activeMatchId,
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  messageScrollHandleRef,
  messages,
  onLoadOlderMessages,
}: ActiveSearchMatchScrollInput) {
  useEffect(() => {
    return runActiveSearchMatchScrollAction(
      getActiveSearchMatchScrollAction({
        activeMatchId,
        hasOlderMessages,
        isLoadingOlderMessages,
        messageScrollHandleRef,
        messages,
        onLoadOlderMessages,
      }),
    );
  }, [
    activeMatchId,
    hasOlderMessages,
    isLoadingOlderMessages,
    messageScrollHandleRef,
    messages,
    onLoadOlderMessages,
  ]);
}

function getActiveSearchMatchScrollAction({
  activeMatchId,
  hasOlderMessages,
  isLoadingOlderMessages,
  messageScrollHandleRef,
  messages,
  onLoadOlderMessages,
}: ActiveSearchMatchScrollInput): ActiveSearchMatchScrollAction {
  if (!activeMatchId) {
    return { kind: "idle" };
  }

  if (!hasLoadedMessage(messages, activeMatchId)) {
    return getMissingSearchMatchLoadAction({
      hasOlderMessages,
      isLoadingOlderMessages,
      onLoadOlderMessages,
    });
  }

  return {
    kind: "scroll",
    messageId: activeMatchId,
    messageScrollHandleRef,
  };
}

function getMissingSearchMatchLoadAction(
  loadInput: Pick<
    UseConversationMessageSearchInput,
    "hasOlderMessages" | "isLoadingOlderMessages" | "onLoadOlderMessages"
  >,
): ActiveSearchMatchScrollAction {
  if (
    !shouldLoadMissingSearchMatch(loadInput) ||
    !loadInput.onLoadOlderMessages
  ) {
    return { kind: "idle" };
  }

  return {
    kind: "load",
    onLoadOlderMessages: loadInput.onLoadOlderMessages,
  };
}

function runActiveSearchMatchScrollAction(
  action: ActiveSearchMatchScrollAction,
) {
  if (action.kind === "load") {
    void action.onLoadOlderMessages();
    return undefined;
  }

  if (action.kind === "scroll") {
    const frame = requestAnimationFrame(() => {
      action.messageScrollHandleRef.current?.scrollToMessage(action.messageId, {
        highlight: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }

  return undefined;
}

function hasLoadedMessage(messages: UnifiedMessage[], messageId: string) {
  return messages.some((message) => message.id === messageId);
}

function shouldLoadMissingSearchMatch({
  hasOlderMessages,
  isLoadingOlderMessages,
  onLoadOlderMessages,
}: Pick<
  UseConversationMessageSearchInput,
  "hasOlderMessages" | "isLoadingOlderMessages" | "onLoadOlderMessages"
>) {
  return Boolean(
    hasOlderMessages && !isLoadingOlderMessages && onLoadOlderMessages,
  );
}

function getIsSearchInFlight({
  debouncedQuery,
  isFetching,
  normalizedQuery,
}: SearchInFlightInput) {
  return (
    normalizedQuery.length > 0 &&
    (debouncedQuery !== normalizedQuery || isFetching)
  );
}
