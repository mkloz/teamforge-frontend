import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type {
  ActivitySelectionKind,
  TypingParticipant,
} from "@/features/activity/store/activity-store/activity-store.types";
import type { ChatApi } from "@/shared/schemas";

interface SelectedConversationQueryState<TData> {
  data: TData | undefined;
  isError: boolean;
  isLoading: boolean;
}

interface GetSelectedConversationChatIdInput {
  directSelection: ActivityDirectSelectionData | undefined;
  groupSelection: ActivityGroupSelectionData | undefined;
  selectedKind: ActivitySelectionKind | null;
}

interface GetSelectedConversationParticipantsInput {
  directSelection: ActivityDirectSelectionData | undefined;
  groupSelection: ActivityGroupSelectionData | undefined;
  selectedChatSummary: ChatApi | null;
  selectedKind: ActivitySelectionKind | null;
}

interface GetSelectedConversationStatusInput {
  directQuery: SelectedConversationQueryState<ActivityDirectSelectionData>;
  groupQuery: SelectedConversationQueryState<ActivityGroupSelectionData>;
  selectedId: string | null;
  selectedKind: ActivitySelectionKind | null;
}

export function getSelectedConversationChatId({
  directSelection,
  groupSelection,
  selectedKind,
}: GetSelectedConversationChatIdInput) {
  if (selectedKind === "group") {
    return groupSelection?.chatId ?? null;
  }

  if (selectedKind === "dm") {
    return directSelection?.chatId ?? null;
  }

  return null;
}

export function findSelectedChatSummary(
  chats: ChatApi[] | undefined,
  chatId: string | null,
) {
  return chats?.find((chat) => chat.id === chatId) ?? null;
}

export function getSelectedConversationParticipants({
  directSelection,
  groupSelection,
  selectedChatSummary,
  selectedKind,
}: GetSelectedConversationParticipantsInput) {
  const participants = getSelectedParticipants({
    directSelection,
    groupSelection,
    selectedKind,
  });

  return applyReadCursorsToParticipants(participants, selectedChatSummary);
}

export function getSelectedConversationStatus({
  directQuery,
  groupQuery,
  selectedId,
  selectedKind,
}: GetSelectedConversationStatusInput) {
  if (selectedKind === "group") {
    return {
      isSelectedConversationError:
        Boolean(selectedId) && groupQuery.isError && !groupQuery.data,
      isSelectedConversationLoading:
        Boolean(selectedId) && groupQuery.isLoading && !groupQuery.data,
    };
  }

  if (selectedKind === "dm") {
    return {
      isSelectedConversationError:
        Boolean(selectedId) && directQuery.isError && !directQuery.data,
      isSelectedConversationLoading:
        Boolean(selectedId) && directQuery.isLoading && !directQuery.data,
    };
  }

  return {
    isSelectedConversationError: false,
    isSelectedConversationLoading: false,
  };
}

export function getActiveTypingUsers(
  chatId: string | null,
  typingByChatId: Record<string, TypingParticipant[]>,
) {
  return chatId ? (typingByChatId[chatId] ?? []) : [];
}

function getSelectedParticipants({
  directSelection,
  groupSelection,
  selectedKind,
}: Omit<GetSelectedConversationParticipantsInput, "selectedChatSummary">) {
  if (selectedKind === "group") {
    return (
      groupSelection?.group?.members
        ?.map((member) => member.user)
        .filter(isActivityParticipant) ?? []
    );
  }

  if (selectedKind === "dm") {
    return (
      directSelection?.chat?.participants
        ?.map((participant) => participant.user)
        .filter(isActivityParticipant) ?? []
    );
  }

  return [];
}

function isActivityParticipant(
  participant: ActivityParticipant | undefined,
): participant is ActivityParticipant {
  return participant !== undefined;
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
