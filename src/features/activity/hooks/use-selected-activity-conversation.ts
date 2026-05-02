import { useQuery } from "@tanstack/react-query";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { useActivityStore } from "@/features/activity/store/activity.store";

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

  const groupQuery = useQuery({
    ...ActivityQueryFactory.groupSelection(selectedId ?? ""),
    enabled: selectedKind === "group" && !!selectedId,
  });

  const directQuery = useQuery({
    ...ActivityQueryFactory.directSelection(selectedId ?? ""),
    enabled: selectedKind === "dm" && !!selectedId,
  });

  const selectedParticipants =
    selectedKind === "group"
      ? (groupQuery.data?.group?.members
          ?.map((member) => member.user)
          .filter(isActivityParticipant) ?? [])
      : selectedKind === "dm"
        ? (directQuery.data?.chat?.participants
            ?.map((participant) => participant.user)
            .filter(isActivityParticipant) ?? [])
        : [];

  const chatId =
    selectedKind === "group"
      ? (groupQuery.data?.chatId ?? null)
      : selectedKind === "dm"
        ? (directQuery.data?.chatId ?? null)
        : null;

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
    proposalMessages: groupQuery.data?.proposalMessages ?? [],
    activeTypingUsers: chatId ? (typingByChatId[chatId] ?? []) : [],
  };
}
