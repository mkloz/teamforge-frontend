import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { ActivityQueries } from "../api/activity.queries";
import { useActivityStore } from "../store/activity.store";
import { AuthQueries } from "@/features/auth/api/auth.queries";

export function useActivitySelection() {
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const groups = useActivityStore((state) => state.groups);
  const direct = useActivityStore((state) => state.direct);
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const currentUserQuery = useQuery(AuthQueries.currentUser());
  const chatsQuery = useQuery(ActivityQueries.chats());

  const groupQuery = useQuery({
    ...ActivityQueries.groupSelection(selectedId ?? ""),
    enabled: selectedKind === "group" && !!selectedId,
  });

  const directQuery = useQuery({
    ...ActivityQueries.directSelection(selectedId ?? ""),
    enabled: selectedKind === "dm" && !!selectedId,
  });

  const selectedParticipants = useMemo(() => {
    if (selectedKind === "group") {
      const group = groupQuery.data?.group;
      return (
        group?.members
          ?.map((member) => member.user)
          .filter((participant) => participant !== undefined) ?? []
      );
    }

    if (selectedKind === "dm") {
      return (
        directQuery.data?.chat?.participants
          ?.map((participant) => participant.user)
          .filter((participant) => participant !== undefined) ?? []
      );
    }

    return [];
  }, [
    directQuery.data?.chat?.participants,
    groupQuery.data?.group,
    selectedKind,
  ]);

  const chatId =
    selectedKind === "group"
      ? (groupQuery.data?.chatId ?? null)
      : selectedKind === "dm"
        ? (directQuery.data?.chatId ?? null)
        : null;

  const messagesQuery = useInfiniteQuery({
    ...ActivityQueries.conversationMessages(
      chatId ?? "__missing__",
      selectedParticipants,
      currentUserQuery.data?.id ?? "",
    ),
    enabled:
      !!chatId &&
      selectedParticipants.length > 0 &&
      currentUserQuery.data !== undefined,
  });

  const flattenedMessages = ActivityQueries.flattenMessagePages(
    messagesQuery.data,
  );
  const selectedGroupMessages = useMemo(
    () =>
      selectedKind === "group"
        ? ActivityQueries.buildConversationTimeline(
            flattenedMessages,
            groupQuery.data?.proposalMessages ?? [],
          )
        : [],
    [flattenedMessages, groupQuery.data?.proposalMessages, selectedKind],
  );
  const selectedDirectMessages = selectedKind === "dm" ? flattenedMessages : [];

  const latestReadableMessageId =
    flattenedMessages[flattenedMessages.length - 1]?.id ?? null;
  const lastMarkedReadRef = useRef<string | null>(null);
  const activeTypingUsers = chatId ? (typingByChatId[chatId] ?? []) : [];

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
    void ActivityQueries.markChatRead(chatId, latestReadableMessageId);
  }, [chatId, chatsQuery.data, latestReadableMessageId]);

  return {
    selectedId,
    selectedKind,
    groups,
    direct,
    selectedGroup:
      selectedKind === "group" ? (groupQuery.data?.group ?? null) : null,
    selectedGroupMessages,
    typingUsers: selectedKind === "group" ? activeTypingUsers : [],
    selectedChat:
      selectedKind === "dm" ? (directQuery.data?.chat ?? null) : null,
    selectedDirectMessages,
    isTyping: selectedKind === "dm" ? activeTypingUsers.length > 0 : false,
    hasOlderMessages: messagesQuery.hasNextPage,
    isLoadingOlderMessages: messagesQuery.isFetchingNextPage,
    loadOlderMessages: async () => {
      if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
        await messagesQuery.fetchNextPage();
      }
    },
  };
}
