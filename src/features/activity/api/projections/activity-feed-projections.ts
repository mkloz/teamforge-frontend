import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type {
  ActivityParticipant,
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  applyFilter,
  sortByPinnedThenRecency,
} from "@/features/activity/lib/unify-conversations";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  PlanProposal,
  User,
} from "@/shared/schemas";
import {
  buildDirectFeedItem,
  buildNotesFeedItem,
} from "./activity-direct-projections";
import { buildGroupFeedItem } from "./activity-group-projections";
import { mapCurrentUserParticipant } from "./activity-participant-projections";

type TypingUsersByChatId = Record<
  string,
  Array<{ id: string; name: string; avatar: string | null }>
>;

interface ChatIndexes {
  byGroupId: Map<string, ChatApi>;
  byId: Map<string, ChatApi>;
}

interface FeedItemGroups {
  groupItems: UnifiedConversation[];
  directItems: UnifiedConversation[];
  notesItems: UnifiedConversation[];
}

type GroupFeedItem = UnifiedConversation & { kind: "group" };
type FeedItemGroup = UnifiedConversation["group"];

export interface ActivityFeedStateMeta {
  pinnedConversationKeys: string[];
  planProposalsByGroupId?: Record<string, PlanProposal[]>;
  savedMessagesById: Record<string, SavedMessageSnapshot>;
}

export function deriveFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUser: User,
  typingByChatId: TypingUsersByChatId,
  meta: ActivityFeedStateMeta = {
    pinnedConversationKeys: [],
    planProposalsByGroupId: {},
    savedMessagesById: {},
  },
): ActivityFeedData {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const feedItemGroups = buildFeedItemGroups(
    groups,
    chats,
    friendships,
    currentUserParticipant,
    typingByChatId,
  );

  const items = buildSortedFeedItems(feedItemGroups, meta, currentUser.id);

  return buildActivityFeedData(
    activeFilter,
    searchQuery,
    items,
    feedItemGroups,
    meta,
  );
}

function buildFeedItemGroups(
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
): FeedItemGroups {
  const chatIndexes = indexChats(chats);

  return {
    groupItems: buildGroupItems(
      groups,
      chatIndexes.byGroupId,
      currentUserParticipant,
      typingByChatId,
    ),
    directItems: buildDirectItems(
      friendships,
      chatIndexes.byId,
      currentUserParticipant,
      typingByChatId,
    ),
    notesItems: buildNotesItems(chats, currentUserParticipant, typingByChatId),
  };
}

function indexChats(chats: ChatApi[]): ChatIndexes {
  const byGroupId = new Map<string, ChatApi>();
  const byId = new Map(chats.map((chat) => [chat.id, chat]));

  for (const chat of chats) {
    if (chat.groupId) {
      byGroupId.set(chat.groupId, chat);
    }
  }

  return { byGroupId, byId };
}

function buildGroupItems(
  groups: GroupApi[],
  chatsByGroupId: Map<string, ChatApi>,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return groups.map((group) =>
    buildGroupFeedItem(
      group,
      chatsByGroupId.get(group.id) ?? null,
      currentUserParticipant,
      typingByChatId,
    ),
  );
}

function buildDirectItems(
  friendships: FriendshipApi[],
  chatsById: Map<string, ChatApi>,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return friendships.flatMap((friendship) => {
    const chatSummary = friendship.privateChat
      ? (chatsById.get(friendship.privateChat.id) ?? null)
      : null;
    const item = buildDirectFeedItem(
      friendship,
      chatSummary,
      currentUserParticipant,
      typingByChatId,
    );

    return item ? [item] : [];
  });
}

function buildNotesItems(
  chats: ChatApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return chats
    .filter((chat) => chat.type === "NOTES")
    .map((chat) =>
      buildNotesFeedItem(chat, currentUserParticipant, typingByChatId),
    );
}

function buildSortedFeedItems(
  feedItemGroups: FeedItemGroups,
  meta: ActivityFeedStateMeta,
  currentUserId: string,
) {
  return sortByPinnedThenRecency(
    enrichFeedItems(flattenFeedItems(feedItemGroups), meta, currentUserId),
    meta.pinnedConversationKeys,
  );
}

function flattenFeedItems({
  notesItems,
  groupItems,
  directItems,
}: FeedItemGroups) {
  return [...notesItems, ...groupItems, ...directItems];
}

function buildActivityFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  items: UnifiedConversation[],
  { groupItems, directItems, notesItems }: FeedItemGroups,
  meta: ActivityFeedStateMeta,
): ActivityFeedData {
  return {
    allItems: items,
    items: applyFilter(items, activeFilter, searchQuery),
    groupCount: groupItems.length,
    dmCount: directItems.length + notesItems.length,
    unreadCount: items.filter((item) => item.unreadCount > 0).length,
    pinnedCount: items.filter((item) => item.isPinned).length,
    allUnreadMessageCount: countUnreadMessages(items),
    groupUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.kind === "group"),
    ),
    dmUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.kind === "dm"),
    ),
    pinnedUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.isPinned),
    ),
    savedCount: Object.keys(meta.savedMessagesById).length,
  };
}

function countUnreadMessages(items: UnifiedConversation[]) {
  return items.reduce((total, item) => total + item.unreadCount, 0);
}

function enrichFeedItems(
  items: UnifiedConversation[],
  meta: ActivityFeedStateMeta,
  currentUserId: string,
): UnifiedConversation[] {
  const savedByConversation = groupSavedMessagesByConversation(
    meta.savedMessagesById,
  );

  return items.map((item) =>
    enrichFeedItem(item, meta, savedByConversation, currentUserId),
  );
}

function enrichFeedItem(
  item: UnifiedConversation,
  meta: ActivityFeedStateMeta,
  savedByConversation: Map<string, SavedMessageSnapshot[]>,
  currentUserId: string,
): UnifiedConversation {
  const key = getActivityConversationKey(item.kind, item.id);
  const savedMessages = savedByConversation.get(key) ?? [];
  const planProposals = getFeedItemPlanProposals(item, meta);

  return {
    ...item,
    activeProposalCount: getFeedItemActiveProposalCount(
      item,
      planProposals,
      currentUserId,
    ),
    group: getEnrichedFeedItemGroup(item, planProposals),
    isPinned: meta.pinnedConversationKeys.includes(key),
    savedMessageCount: savedMessages.length,
    latestSavedMessage: savedMessages[0]?.message,
  };
}

function getFeedItemPlanProposals(
  item: UnifiedConversation,
  meta: ActivityFeedStateMeta,
) {
  if (!isGroupFeedItem(item)) {
    return undefined;
  }

  return getGroupFeedItemPlanProposals(item, meta);
}

function isGroupFeedItem(item: UnifiedConversation): item is GroupFeedItem {
  return item.kind === "group";
}

function getGroupFeedItemPlanProposals(
  item: GroupFeedItem,
  meta: ActivityFeedStateMeta,
) {
  const proposalOverride = getPlanProposalOverride(item.id, meta);

  if (hasPlanProposalOverride(proposalOverride)) {
    return proposalOverride;
  }

  return getExistingGroupPlanProposals(item);
}

function getPlanProposalOverride(groupId: string, meta: ActivityFeedStateMeta) {
  return meta.planProposalsByGroupId?.[groupId];
}

function hasPlanProposalOverride(
  planProposals: PlanProposal[] | null | undefined,
): planProposals is PlanProposal[] {
  return planProposals !== undefined && planProposals !== null;
}

function getExistingGroupPlanProposals(item: GroupFeedItem) {
  return item.group?.plan?.proposals;
}

function getFeedItemActiveProposalCount(
  item: UnifiedConversation,
  planProposals: PlanProposal[] | undefined,
  currentUserId: string,
) {
  if (item.kind !== "group" || !planProposals) {
    return undefined;
  }

  return countPendingUnvotedProposals(planProposals, currentUserId);
}

function getEnrichedFeedItemGroup(
  item: UnifiedConversation,
  planProposals: PlanProposal[] | undefined,
) {
  if (!isGroupFeedItem(item)) {
    return item.group;
  }

  return getGroupWithEnrichedPlan(item.group, planProposals);
}

function getGroupWithEnrichedPlan(
  group: FeedItemGroup,
  planProposals: PlanProposal[] | undefined,
) {
  if (!group) {
    return group;
  }

  const { plan } = group;

  if (!plan) {
    return group;
  }

  return {
    ...group,
    plan: {
      ...plan,
      proposals: getPlanProposalsWithFallback(planProposals, plan.proposals),
    },
  };
}

function getPlanProposalsWithFallback(
  planProposals: PlanProposal[] | undefined,
  fallback: PlanProposal[] | undefined,
) {
  return planProposals ?? fallback;
}

function countPendingUnvotedProposals(
  proposals: PlanProposal[],
  currentUserId: string,
) {
  return proposals.filter(
    (proposal) =>
      proposal.status === "PENDING" &&
      !proposal.votes.some((vote) => vote.userId === currentUserId),
  ).length;
}

function groupSavedMessagesByConversation(
  savedMessagesById: Record<string, SavedMessageSnapshot>,
) {
  const grouped = new Map<string, SavedMessageSnapshot[]>();

  for (const snapshot of Object.values(savedMessagesById)) {
    const key = getActivityConversationKey(
      snapshot.conversationKind,
      snapshot.conversationId,
    );
    const current = grouped.get(key) ?? [];

    grouped.set(key, [...current, snapshot]);
  }

  for (const [key, snapshots] of grouped) {
    grouped.set(
      key,
      [...snapshots].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      ),
    );
  }

  return grouped;
}
