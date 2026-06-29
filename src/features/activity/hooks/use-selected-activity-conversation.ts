import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import {
  findSelectedChatSummary,
  getActiveTypingUsers,
  getSelectedConversationChatId,
  getSelectedConversationParticipants,
  getSelectedConversationStatus,
} from "@/features/activity/hooks/use-selected-activity-conversation-state";
import { ActivityQueryFactory } from "@/features/activity/public/activity-query-factory";
import { useActivityStore } from "@/features/activity/store/activity.store";
import type { ActivitySelectionKind } from "@/features/activity/store/activity-store/activity-store.types";

export function useSelectedActivityConversation() {
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const groups = useActivityStore((state) => state.groups);
  const direct = useActivityStore((state) => state.direct);
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const chatsQuery = useQuery(ActivityQueryFactory.chats());

  const groupQuery = useQuery({
    ...ActivityQueryFactory.groupSelection(selectedId ?? ""),
    enabled: isSelectedConversationQueryEnabled(
      selectedKind,
      selectedId,
      "group",
    ),
  });

  const directQuery = useQuery({
    ...ActivityQueryFactory.directSelection(selectedId ?? ""),
    enabled: isSelectedConversationQueryEnabled(selectedKind, selectedId, "dm"),
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

function isSelectedConversationQueryEnabled(
  selectedKind: ActivitySelectionKind | null,
  selectedId: string | null,
  queryKind: Extract<ActivitySelectionKind, "dm" | "group">,
) {
  return selectedKind === queryKind && Boolean(selectedId);
}

function getSelectedConversationData({
  directSelection,
  groupSelection,
  selectedKind,
}: {
  directSelection: ActivityDirectSelectionData | undefined;
  groupSelection: ActivityGroupSelectionData | undefined;
  selectedKind: ActivitySelectionKind | null;
}) {
  return {
    proposalMessages: getSelectedProposalMessages(groupSelection),
    selectedChat: getSelectedDirectChat(directSelection, selectedKind),
    selectedGroup: getSelectedGroup(groupSelection, selectedKind),
  };
}

function getSelectedProposalMessages(
  groupSelection: ActivityGroupSelectionData | undefined,
) {
  return groupSelection?.proposalMessages ?? [];
}

function getSelectedDirectChat(
  directSelection: ActivityDirectSelectionData | undefined,
  selectedKind: ActivitySelectionKind | null,
) {
  return selectedKind === "dm" ? (directSelection?.chat ?? null) : null;
}

function getSelectedGroup(
  groupSelection: ActivityGroupSelectionData | undefined,
  selectedKind: ActivitySelectionKind | null,
) {
  return selectedKind === "group" ? (groupSelection?.group ?? null) : null;
}

async function retrySelectedConversationQuery({
  directRefetch,
  groupRefetch,
  selectedKind,
}: {
  directRefetch: () => Promise<unknown>;
  groupRefetch: () => Promise<unknown>;
  selectedKind: ActivitySelectionKind | null;
}) {
  if (selectedKind === "group") {
    await groupRefetch();
    return;
  }

  if (selectedKind === "dm") {
    await directRefetch();
  }
}
