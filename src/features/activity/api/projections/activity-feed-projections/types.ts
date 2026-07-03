import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import type { ChatApi, PlanProposal } from "@/shared/schemas";

export type TypingUsersByChatId = Record<
  string,
  Array<{ id: string; name: string; avatar: string | null }>
>;

export interface ChatIndexes {
  byGroupId: Map<string, ChatApi>;
  byId: Map<string, ChatApi>;
}

export interface FeedItemGroups {
  groupItems: UnifiedConversation[];
  directItems: UnifiedConversation[];
  notesItems: UnifiedConversation[];
}

export type GroupFeedItem = UnifiedConversation & { kind: "group" };
export type FeedItemGroup = UnifiedConversation["group"];

export interface ActivityFeedStateMeta {
  pinnedConversationKeys: string[];
  planProposalsByGroupId?: Record<string, PlanProposal[]>;
  savedMessagesById: Record<string, SavedMessageSnapshot>;
}
