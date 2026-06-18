import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import {
  findSelectedChatSummary,
  getActiveTypingUsers,
  getSelectedConversationChatId,
  getSelectedConversationParticipants,
  getSelectedConversationStatus,
} from "@/features/activity/hooks/use-selected-activity-conversation-state";
import { useActivityStore } from "@/features/activity/store/activity.store";

export function useSelectedActivityConversation() {
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const groups = useActivityStore((state) => state.groups);
  const direct = useActivityStore((state) => state.direct);
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const chatsQuery = useQuery(ActivityQueryFactory.chats());

  const groupQuery = useQuery({
    ...ActivityQueryFactory.groupSelection(selectedId ?? ""),
    enabled: selectedKind === "group" && !!selectedId,
  });

  const directQuery = useQuery({
    ...ActivityQueryFactory.directSelection(selectedId ?? ""),
    enabled: selectedKind === "dm" && !!selectedId,
  });

  const chatId = getSelectedConversationChatId({
    directSelection: directQuery.data,
    groupSelection: groupQuery.data,
    selectedKind,
  });
  const selectedChatSummary = useMemo(
    () => findSelectedChatSummary(chatsQuery.data, chatId),
    [chatId, chatsQuery.data],
  );
  const selectedParticipants = useMemo(
    () =>
      getSelectedConversationParticipants({
        directSelection: directQuery.data,
        groupSelection: groupQuery.data,
        selectedChatSummary,
        selectedKind,
      }),
    [directQuery.data, groupQuery.data, selectedChatSummary, selectedKind],
  );
  const { isSelectedConversationError, isSelectedConversationLoading } =
    getSelectedConversationStatus({
      directQuery,
      groupQuery,
      selectedId,
      selectedKind,
    });

  async function retrySelectedConversation() {
    if (selectedKind === "group") {
      await groupQuery.refetch();
      return;
    }

    if (selectedKind === "dm") {
      await directQuery.refetch();
    }
  }

  return {
    selectedId,
    selectedKind,
    groups,
    direct,
    chatId,
    selectedParticipants,
    selectedGroup:
      selectedKind === "group" ? (groupQuery.data?.group ?? null) : null,
    selectedChat:
      selectedKind === "dm" ? (directQuery.data?.chat ?? null) : null,
    isSelectedConversationLoading,
    isSelectedConversationError,
    retrySelectedConversation,
    proposalMessages: groupQuery.data?.proposalMessages ?? [],
    activeTypingUsers: getActiveTypingUsers(chatId, typingByChatId),
  };
}
