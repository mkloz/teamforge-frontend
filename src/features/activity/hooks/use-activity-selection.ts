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
    typingUsers:
      conversation.selectedKind === "group"
        ? conversation.activeTypingUsers
        : [],
    selectedChat: conversation.selectedChat,
    selectedDirectMessages: timeline.selectedDirectMessages,
    isSelectedConversationLoading: conversation.isSelectedConversationLoading,
    isMessageTimelineLoading: timeline.isMessageTimelineLoading,
    isTyping:
      conversation.selectedKind === "dm" &&
      conversation.activeTypingUsers.length > 0,
    hasOlderMessages: timeline.hasOlderMessages,
    isLoadingOlderMessages: timeline.isLoadingOlderMessages,
    loadOlderMessages: timeline.loadOlderMessages,
  };
}
