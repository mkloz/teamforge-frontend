import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { useActivityStore } from "@/features/activity/store/activity.store";
import type { ChatApi } from "@/shared/schemas";

function isActivityParticipant(
  participant: ActivityParticipant | undefined,
): participant is ActivityParticipant {
  return participant !== undefined;
}

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

  const chatId =
    selectedKind === "group"
      ? (groupQuery.data?.chatId ?? null)
      : selectedKind === "dm"
        ? (directQuery.data?.chatId ?? null)
        : null;
  const selectedChatSummary = useMemo(
    () => chatsQuery.data?.find((chat) => chat.id === chatId) ?? null,
    [chatId, chatsQuery.data],
  );
  const selectedParticipants = useMemo(() => {
    const participants =
      selectedKind === "group"
        ? (groupQuery.data?.group?.members
            ?.map((member) => member.user)
            .filter(isActivityParticipant) ?? [])
        : selectedKind === "dm"
          ? (directQuery.data?.chat?.participants
              ?.map((participant) => participant.user)
              .filter(isActivityParticipant) ?? [])
          : [];

    return applyReadCursorsToParticipants(participants, selectedChatSummary);
  }, [
    directQuery.data?.chat?.participants,
    groupQuery.data?.group?.members,
    selectedChatSummary,
    selectedKind,
  ]);

  const isSelectedConversationLoading =
    selectedKind === "group"
      ? Boolean(selectedId) && groupQuery.isLoading && !groupQuery.data
      : selectedKind === "dm"
        ? Boolean(selectedId) && directQuery.isLoading && !directQuery.data
        : false;
  const isSelectedConversationError =
    selectedKind === "group"
      ? Boolean(selectedId) && groupQuery.isError && !groupQuery.data
      : selectedKind === "dm"
        ? Boolean(selectedId) && directQuery.isError && !directQuery.data
        : false;

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
    activeTypingUsers: chatId ? (typingByChatId[chatId] ?? []) : [],
  };
}

function applyReadCursorsToParticipants(
  participants: ActivityParticipant[],
  chatSummary: ChatApi | null,
) {
  if (!chatSummary?.participants?.length) {
    return participants;
  }

  const lastReadMessageIdByUserId = new Map(
    chatSummary.participants.map((participant) => [
      participant.userId,
      participant.lastReadMessageId,
    ]),
  );

  return participants.map((participant) => ({
    ...participant,
    lastReadMessageId:
      lastReadMessageIdByUserId.get(participant.id) ??
      participant.lastReadMessageId ??
      null,
  }));
}
