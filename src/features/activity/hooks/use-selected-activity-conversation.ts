import { useMemo } from "react";
import { useSelectedConversationQueries } from "@/features/activity/hooks/use-selected-activity-conversation/queries";
import { retrySelectedConversationQuery } from "@/features/activity/hooks/use-selected-activity-conversation/retry";
import { getSelectedConversationData } from "@/features/activity/hooks/use-selected-activity-conversation/selection-data";
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
  const { chatsQuery, directQuery, groupQuery } =
    useSelectedConversationQueries({
      selectedId,
      selectedKind,
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
  const selectedConversation = getSelectedConversationData({
    directSelection: directQuery.data,
    groupSelection: groupQuery.data,
    selectedKind,
  });

  async function retrySelectedConversation() {
    await retrySelectedConversationQuery({
      directRefetch: directQuery.refetch,
      groupRefetch: groupQuery.refetch,
      selectedKind,
    });
  }

  return {
    selectedId,
    selectedKind,
    groups,
    direct,
    chatId,
    selectedParticipants,
    selectedGroup: selectedConversation.selectedGroup,
    selectedChat: selectedConversation.selectedChat,
    isSelectedConversationLoading,
    isSelectedConversationError,
    retrySelectedConversation,
    proposalMessages: selectedConversation.proposalMessages,
    activeTypingUsers: getActiveTypingUsers(chatId, typingByChatId),
  };
}
