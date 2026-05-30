import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type {
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
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
  meta: ActivityFeedStateMeta = {
    pinnedConversationKeys: [],
    planProposalsByGroupId: {},
    savedMessagesById: {},
  },
): ActivityFeedData {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const groupItems = groups.map((group) =>
    buildGroupFeedItem(group, chats, currentUserParticipant, typingByChatId),
  );
  const directItems = friendships.flatMap((friendship) => {
    const item = buildDirectFeedItem(
      friendship,
      chats,
      currentUserParticipant,
      typingByChatId,
    );

    return item ? [item] : [];
  });
  const notesItems = chats
    .filter((chat) => chat.type === "NOTES")
    .map((chat) =>
      buildNotesFeedItem(chat, currentUserParticipant, typingByChatId),
    );
  const items = sortByPinnedThenRecency(
    enrichFeedItems(
      [...notesItems, ...groupItems, ...directItems],
      meta,
      currentUser.id,
    ),
    meta.pinnedConversationKeys,
  );

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

  return items.map((item) => {
    const key = getActivityConversationKey(item.kind, item.id);
    const savedMessages = savedByConversation.get(key) ?? [];
    const planProposals =
      item.kind === "group"
        ? (meta.planProposalsByGroupId?.[item.id] ??
          item.group?.plan?.proposals)
        : undefined;

    return {
      ...item,
      activeProposalCount:
        item.kind === "group" && planProposals
          ? countPendingUnvotedProposals(planProposals, currentUserId)
          : undefined,
      group:
        item.kind === "group" && item.group?.plan
          ? {
              ...item.group,
              plan: {
                ...item.group.plan,
                proposals: planProposals ?? item.group.plan.proposals,
              },
            }
          : item.group,
      isPinned: meta.pinnedConversationKeys.includes(key),
      savedMessageCount: savedMessages.length,
      latestSavedMessage: savedMessages[0]?.message,
    };
  });
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
