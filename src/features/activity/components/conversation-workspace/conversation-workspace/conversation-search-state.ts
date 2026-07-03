import type { ConversationSearchState } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";

export function getActiveConversationSearchQuery(
  searchState: ConversationSearchState,
  conversationId: string | null,
) {
  return searchState.conversationId === conversationId ? searchState.query : "";
}

export function getNextConversationSearchState(
  conversationId: string | null,
  query: string,
): ConversationSearchState {
  return { conversationId, query };
}
