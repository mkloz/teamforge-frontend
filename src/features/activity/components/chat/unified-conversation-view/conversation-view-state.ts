import type {
  DirectChat,
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

type ConversationInput =
  | { kind: "dm"; data: DirectChat }
  | { kind: "group"; data: Group };

interface SearchResultLabelInput {
  activeMatchIndex: number;
  isSearching: boolean;
  matchCount: number;
  normalizedQuery: string;
}

export interface ConversationViewState {
  activePlan: Plan | null;
  allPinnedMessages: UnifiedMessage[];
  chatId: string | null;
  conversationId: string;
  inputPlaceholder: string | undefined;
  isBlockedDirectChat: boolean;
  isNotesChat: boolean;
}

export function getConversationViewState(
  input: ConversationInput,
): ConversationViewState {
  const { kind, data } = input;
  const isBlockedDirectChat = kind === "dm" && Boolean(data.isBlocked);

  return {
    activePlan: kind === "group" ? (data.plan ?? null) : null,
    allPinnedMessages: getConversationPinnedMessages(input),
    chatId: kind === "group" ? (data.chat?.id ?? null) : data.id,
    conversationId: `${kind}:${data.id}`,
    inputPlaceholder: isBlockedDirectChat
      ? "Unblock this person to send messages"
      : undefined,
    isBlockedDirectChat,
    isNotesChat: kind === "dm" && data.type === "NOTES",
  };
}

export function getSearchResultLabel({
  activeMatchIndex,
  isSearching,
  matchCount,
  normalizedQuery,
}: SearchResultLabelInput) {
  if (!normalizedQuery) {
    return undefined;
  }

  if (isSearching && matchCount === 0) {
    return "Searching...";
  }

  if (matchCount > 0) {
    return `${Math.min(activeMatchIndex + 1, matchCount)}/${matchCount}`;
  }

  return "No results";
}

function getConversationPinnedMessages({
  kind,
  data,
}: ConversationInput): UnifiedMessage[] {
  const pinnedMessages =
    kind === "group" ? data.chat?.pinnedMessages : data.pinnedMessages;

  return (pinnedMessages || []).map((message: UnifiedMessage) =>
    Object.assign({}, message, { isOwn: false }),
  );
}
