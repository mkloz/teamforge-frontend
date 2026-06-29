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
  const isBlockedDirectChat = getIsBlockedDirectChat(input);

  return {
    activePlan: getConversationActivePlan(input),
    allPinnedMessages: getConversationPinnedMessages(input),
    chatId: getConversationChatId(input),
    conversationId: getConversationId(input),
    inputPlaceholder: getConversationInputPlaceholder(isBlockedDirectChat),
    isBlockedDirectChat,
    isNotesChat: getIsNotesChat(input),
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

function getConversationActivePlan(input: ConversationInput): Plan | null {
  return input.kind === "group" ? (input.data.plan ?? null) : null;
}

function getConversationChatId(input: ConversationInput) {
  return input.kind === "group" ? (input.data.chat?.id ?? null) : input.data.id;
}

function getConversationId({ kind, data }: ConversationInput) {
  return `${kind}:${data.id}`;
}

function getConversationInputPlaceholder(isBlockedDirectChat: boolean) {
  return isBlockedDirectChat
    ? "Unblock this person to send messages"
    : undefined;
}

function getIsBlockedDirectChat(input: ConversationInput) {
  return input.kind === "dm" && Boolean(input.data.isBlocked);
}

function getIsNotesChat(input: ConversationInput) {
  return input.kind === "dm" && input.data.type === "NOTES";
}
