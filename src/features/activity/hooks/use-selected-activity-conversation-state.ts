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

type AnySelectedConversationQuery =
  | SelectedConversationQueryState<ActivityDirectSelectionData>
  | SelectedConversationQueryState<ActivityGroupSelectionData>;
type ConversationSelectionKind = Extract<ActivitySelectionKind, "dm" | "group">;
type SelectedConversationChatIdResolver = (
  input: GetSelectedConversationChatIdInput,
) => string | null;

const SELECTED_CONVERSATION_CHAT_ID_RESOLVERS: Record<
  ConversationSelectionKind,
  SelectedConversationChatIdResolver
> = {
  dm: ({ directSelection }) => directSelection?.chatId ?? null,
  group: ({ groupSelection }) => groupSelection?.chatId ?? null,
};

export function getSelectedConversationChatId({
  directSelection,
  groupSelection,
  selectedKind,
}: GetSelectedConversationChatIdInput) {
  if (!isConversationSelectionKind(selectedKind)) {
    return null;
  }

  return SELECTED_CONVERSATION_CHAT_ID_RESOLVERS[selectedKind]({
    directSelection,
    groupSelection,
    selectedKind,
  });
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
  const selectedQuery = getSelectedConversationQuery({
    directQuery,
    groupQuery,
    selectedKind,
  });

  return getSelectedConversationQueryStatus(selectedQuery, selectedId);
}

export function getActiveTypingUsers(
  chatId: string | null,
  typingByChatId: Record<string, TypingParticipant[]>,
) {
  return chatId ? (typingByChatId[chatId] ?? []) : [];
}

function isConversationSelectionKind(
  selectedKind: ActivitySelectionKind | null,
): selectedKind is ConversationSelectionKind {
  return selectedKind === "group" || selectedKind === "dm";
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

function getSelectedConversationQuery({
  directQuery,
  groupQuery,
  selectedKind,
}: Pick<
  GetSelectedConversationStatusInput,
  "directQuery" | "groupQuery" | "selectedKind"
>): AnySelectedConversationQuery | null {
  if (selectedKind === "group") {
    return groupQuery;
  }

  if (selectedKind === "dm") {
    return directQuery;
  }

  return null;
}

function getSelectedConversationQueryStatus(
  selectedQuery: AnySelectedConversationQuery | null,
  selectedId: string | null,
) {
  if (!selectedQuery || !selectedId) {
    return {
      isSelectedConversationError: false,
      isSelectedConversationLoading: false,
    };
  }

  return {
    isSelectedConversationError: selectedQuery.isError && !selectedQuery.data,
    isSelectedConversationLoading:
      selectedQuery.isLoading && !selectedQuery.data,
  };
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
