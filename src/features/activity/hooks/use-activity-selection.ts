import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";

import { useActivityMessageTimeline } from "./use-activity-message-timeline";
import { useSelectedActivityConversation } from "./use-selected-activity-conversation";

export function useActivitySelection() {
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const conversation = useSelectedActivityConversation();
  const timeline = useActivityMessageTimeline({
    chatId: conversation.chatId,
    currentUserId: currentUserQuery.data?.id ?? null,
    proposalMessages: conversation.proposalMessages,
    selectedKind: conversation.selectedKind,
    selectedParticipants: conversation.selectedParticipants,
  });

  return {
    selectedId: conversation.selectedId,
    selectedKind: conversation.selectedKind,
    groups: conversation.groups,
    direct: conversation.direct,
    selectedGroup: conversation.selectedGroup,
    selectedGroupMessages: timeline.selectedGroupMessages,
    firstUnreadMessageId: timeline.firstUnreadMessageId,
    typingUsers:
      conversation.selectedKind === "group"
        ? conversation.activeTypingUsers
        : [],
    selectedChat: conversation.selectedChat,
    selectedDirectMessages: timeline.selectedDirectMessages,
    isSelectedConversationLoading: conversation.isSelectedConversationLoading,
    isSelectedConversationError: conversation.isSelectedConversationError,
    retrySelectedConversation: conversation.retrySelectedConversation,
    isMessageTimelineLoading: timeline.isMessageTimelineLoading,
    isMessageTimelineError: timeline.isMessageTimelineError,
    isTyping:
      conversation.selectedKind === "dm" &&
      conversation.activeTypingUsers.length > 0,
    hasOlderMessages: timeline.hasOlderMessages,
    isLoadingOlderMessages: timeline.isLoadingOlderMessages,
    loadOlderMessages: timeline.loadOlderMessages,
    retryMessageTimeline: timeline.retryMessageTimeline,
  };
}
