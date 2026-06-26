import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import {
  mapSavedMessageApi,
  type SavedMessageSnapshot,
} from "@/features/activity/lib/saved-message";
import type { ChatApi, SavedMessageApi } from "@/shared/schemas";

type ActivityFeedData = ReturnType<typeof ActivityQueryFactory.deriveFeedData>;
export type ActivityFeedFilter = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[0];
type ActivityGroupsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[2];
type ActivityChatsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[3];
type ActivityFriendshipsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[4];
export type ActivityCurrentUserData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[5];
export type ActivityTypingByChatId = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[6];

type ActivityFeedStatusQueryState = {
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
};

type ActivityFeedSavedMessagesStatusQueryState =
  ActivityFeedStatusQueryState & {
    data: unknown;
  };

type ActivityFeedStatusOptions = {
  activeFilter: ActivityFeedFilter;
  chatsQuery: ActivityFeedStatusQueryState;
  currentUserQuery: ActivityFeedStatusQueryState;
  feedData: ActivityFeedData | null;
  friendshipsQuery: ActivityFeedStatusQueryState;
  groupsQuery: ActivityFeedStatusQueryState;
  needsFriendshipData: boolean;
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState;
};

type ActivityFeedStatus = {
  isFeedError: boolean;
  isFeedRetrying: boolean;
  isInitialLoading: boolean;
  isSavedMessagesError: boolean;
  isSavedMessagesLoading: boolean;
  isSavedMessagesRetrying: boolean;
};

type LoadedFeedDataOptions = {
  activeFilter: ActivityFeedFilter;
  chats: ActivityChatsData | undefined;
  currentUser: ActivityCurrentUserData | undefined;
  deferredSearchQuery: string;
  friendships: ActivityFriendshipsData | undefined;
  groups: ActivityGroupsData | undefined;
  needsFriendshipData: boolean;
  pinnedConversationKeys: string[];
  savedMessagesById: Record<string, SavedMessageSnapshot>;
  typingByChatId: ActivityTypingByChatId;
};

type LoadedFeedRequiredData = {
  chats: ActivityChatsData;
  currentUser: ActivityCurrentUserData;
  friendships: ActivityFriendshipsData;
  groups: ActivityGroupsData;
};

type LoadedFeedCoreData = Omit<LoadedFeedRequiredData, "friendships">;

type ActivityFeedReturnStateOptions = {
  chats: ActivityChatsData | undefined;
  feedData: ActivityFeedData | null;
  refetchFeedQueries: () => Promise<void>;
  refetchSavedMessages: () => Promise<void>;
  savedMessages: SavedMessageSnapshot[];
  savedMessagesById: Record<string, SavedMessageSnapshot>;
  status: ActivityFeedStatus;
};

type ActivityFeedBaseStatusOptions = Pick<
  ActivityFeedStatusOptions,
  | "chatsQuery"
  | "currentUserQuery"
  | "feedData"
  | "friendshipsQuery"
  | "groupsQuery"
  | "needsFriendshipData"
>;

type ActivityFeedRetryStatusOptions = Pick<
  ActivityFeedStatusOptions,
  | "chatsQuery"
  | "currentUserQuery"
  | "friendshipsQuery"
  | "groupsQuery"
  | "savedMessagesQuery"
>;

type ActivityFeedCountKey =
  | "groupCount"
  | "dmCount"
  | "unreadCount"
  | "pinnedCount"
  | "allUnreadMessageCount"
  | "groupUnreadMessageCount"
  | "dmUnreadMessageCount"
  | "pinnedUnreadMessageCount"
  | "savedCount";

export function deriveLoadedActivityFeedData({
  activeFilter,
  chats,
  currentUser,
  deferredSearchQuery,
  friendships,
  groups,
  needsFriendshipData,
  pinnedConversationKeys,
  savedMessagesById,
  typingByChatId,
}: LoadedFeedDataOptions) {
  const requiredData = getLoadedFeedRequiredData({
    chats,
    currentUser,
    friendships,
    groups,
    needsFriendshipData,
  });

  if (!requiredData) {
    return null;
  }

  return ActivityQueryFactory.deriveFeedData(
    activeFilter,
    deferredSearchQuery,
    requiredData.groups,
    requiredData.chats,
    requiredData.friendships,
    requiredData.currentUser,
    typingByChatId,
    {
      pinnedConversationKeys,
      savedMessagesById,
    },
  );
}

function getLoadedFeedRequiredData({
  chats,
  currentUser,
  friendships,
  groups,
  needsFriendshipData,
}: Pick<
  LoadedFeedDataOptions,
  "chats" | "currentUser" | "friendships" | "groups" | "needsFriendshipData"
>): LoadedFeedRequiredData | null {
  const coreData = getLoadedFeedCoreData({ chats, currentUser, groups });

  if (!coreData) {
    return null;
  }

  const loadedFriendships = getLoadedFriendships(
    friendships,
    needsFriendshipData,
  );

  if (!loadedFriendships) {
    return null;
  }

  return {
    ...coreData,
    friendships: loadedFriendships,
  };
}

function getLoadedFeedCoreData({
  chats,
  currentUser,
  groups,
}: Pick<
  LoadedFeedDataOptions,
  "chats" | "currentUser" | "groups"
>): LoadedFeedCoreData | null {
  if (!currentUser) {
    return null;
  }

  if (!groups) {
    return null;
  }

  if (!chats) {
    return null;
  }

  return { chats, currentUser, groups };
}

function getLoadedFriendships(
  friendships: ActivityFriendshipsData | undefined,
  needsFriendshipData: boolean,
) {
  if (friendships) {
    return friendships;
  }

  return needsFriendshipData ? null : [];
}

export function deriveActivityFeedStatus({
  activeFilter,
  chatsQuery,
  currentUserQuery,
  feedData,
  friendshipsQuery,
  groupsQuery,
  needsFriendshipData,
  savedMessagesQuery,
}: ActivityFeedStatusOptions): ActivityFeedStatus {
  const baseStatusOptions = {
    chatsQuery,
    currentUserQuery,
    feedData,
    friendshipsQuery,
    groupsQuery,
    needsFriendshipData,
  };

  return {
    isFeedError:
      hasBaseDataError(baseStatusOptions) ||
      hasSavedMessagesFeedError(activeFilter, savedMessagesQuery),
    isFeedRetrying: isAnyFeedQueryFetching({
      chatsQuery,
      currentUserQuery,
      friendshipsQuery,
      groupsQuery,
      savedMessagesQuery,
    }),
    isInitialLoading: isBaseDataInitiallyLoading(baseStatusOptions),
    isSavedMessagesError: hasSavedMessagesLoadError(savedMessagesQuery),
    isSavedMessagesLoading: isSavedMessagesInitiallyLoading(
      activeFilter,
      savedMessagesQuery,
    ),
    isSavedMessagesRetrying: savedMessagesQuery.isFetching,
  };
}

export function deriveSavedMessageData(
  items: SavedMessageApi[],
  currentUser: ActivityCurrentUserData | undefined,
) {
  const savedMessages = currentUser
    ? mapSavedMessages(items, currentUser.id)
    : [];

  return {
    savedMessages,
    savedMessagesById: getSavedMessagesById(savedMessages),
  };
}

export function composeActivityFeedDerivedState({
  chats,
  feedData,
  refetchFeedQueries,
  refetchSavedMessages,
  savedMessages,
  savedMessagesById,
  status,
}: ActivityFeedReturnStateOptions) {
  const feedCounts = getActivityFeedCounts(feedData);
  const feedItems = getActivityFeedItems(feedData);

  return {
    ...status,
    ...feedItems,
    ...feedCounts,
    chats: chats ?? [],
    savedMessages,
    savedMessagesById,
    refetchFeedQueries,
    refetchSavedMessages,
  };
}

function hasBaseDataError(options: ActivityFeedBaseStatusOptions) {
  return (
    hasBlockingBaseDataError(options) || hasPartialFriendshipsError(options)
  );
}

function hasBlockingBaseDataError({
  chatsQuery,
  currentUserQuery,
  feedData,
  friendshipsQuery,
  groupsQuery,
  needsFriendshipData,
}: ActivityFeedBaseStatusOptions) {
  return (
    feedData === null &&
    hasRequiredBaseQueryError({
      chatsQuery,
      currentUserQuery,
      friendshipsQuery,
      groupsQuery,
      needsFriendshipData,
    })
  );
}

function hasPartialFriendshipsError({
  feedData,
  friendshipsQuery,
  needsFriendshipData,
}: ActivityFeedBaseStatusOptions) {
  return (
    !needsFriendshipData && friendshipsQuery.isError && isFeedEmpty(feedData)
  );
}

function hasSavedMessagesFeedError(
  activeFilter: ActivityFeedFilter,
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState,
) {
  return isSavedFilter(activeFilter) && savedMessagesQuery.isError;
}

function hasSavedMessagesLoadError(
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState,
) {
  return (
    savedMessagesQuery.isError && !hasSavedMessagesData(savedMessagesQuery)
  );
}

function isSavedMessagesInitiallyLoading(
  activeFilter: ActivityFeedFilter,
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState,
) {
  return (
    isSavedFilter(activeFilter) &&
    savedMessagesQuery.isPending &&
    !hasSavedMessagesData(savedMessagesQuery)
  );
}

function isAnyFeedQueryFetching({
  chatsQuery,
  currentUserQuery,
  friendshipsQuery,
  groupsQuery,
  savedMessagesQuery,
}: ActivityFeedRetryStatusOptions) {
  return (
    currentUserQuery.isFetching ||
    groupsQuery.isFetching ||
    chatsQuery.isFetching ||
    friendshipsQuery.isFetching ||
    savedMessagesQuery.isFetching
  );
}

function isBaseDataInitiallyLoading({
  chatsQuery,
  currentUserQuery,
  feedData,
  friendshipsQuery,
  groupsQuery,
  needsFriendshipData,
}: ActivityFeedBaseStatusOptions) {
  return (
    feedData === null &&
    hasRequiredBaseQueryPending({
      chatsQuery,
      currentUserQuery,
      friendshipsQuery,
      groupsQuery,
      needsFriendshipData,
    })
  );
}

function hasRequiredBaseQueryError({
  chatsQuery,
  currentUserQuery,
  friendshipsQuery,
  groupsQuery,
  needsFriendshipData,
}: Omit<ActivityFeedBaseStatusOptions, "feedData">) {
  return (
    currentUserQuery.isError ||
    groupsQuery.isError ||
    chatsQuery.isError ||
    (needsFriendshipData && friendshipsQuery.isError)
  );
}

function hasRequiredBaseQueryPending({
  chatsQuery,
  currentUserQuery,
  friendshipsQuery,
  groupsQuery,
  needsFriendshipData,
}: Omit<ActivityFeedBaseStatusOptions, "feedData">) {
  return (
    currentUserQuery.isPending ||
    groupsQuery.isPending ||
    chatsQuery.isPending ||
    (needsFriendshipData && friendshipsQuery.isPending)
  );
}

function isSavedFilter(activeFilter: ActivityFeedFilter) {
  return activeFilter === "saved";
}

function hasSavedMessagesData(
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState,
) {
  return Boolean(savedMessagesQuery.data);
}

function isFeedEmpty(feedData: ActivityFeedData | null) {
  return (feedData?.allItems.length ?? 0) === 0;
}

function getActivityFeedItems(feedData: ActivityFeedData | null) {
  return {
    allItems: feedData?.allItems ?? [],
    filteredItems: feedData?.items ?? [],
  };
}

function getActivityFeedCounts(feedData: ActivityFeedData | null) {
  return {
    groupCount: getActivityFeedCount(feedData, "groupCount"),
    dmCount: getActivityFeedCount(feedData, "dmCount"),
    unreadCount: getActivityFeedCount(feedData, "unreadCount"),
    pinnedCount: getActivityFeedCount(feedData, "pinnedCount"),
    allUnreadMessageCount: getActivityFeedCount(
      feedData,
      "allUnreadMessageCount",
    ),
    groupUnreadMessageCount: getActivityFeedCount(
      feedData,
      "groupUnreadMessageCount",
    ),
    dmUnreadMessageCount: getActivityFeedCount(
      feedData,
      "dmUnreadMessageCount",
    ),
    pinnedUnreadMessageCount: getActivityFeedCount(
      feedData,
      "pinnedUnreadMessageCount",
    ),
    savedCount: getActivityFeedCount(feedData, "savedCount"),
  };
}

function getActivityFeedCount(
  feedData: ActivityFeedData | null,
  key: ActivityFeedCountKey,
) {
  return feedData?.[key] ?? 0;
}

export function getPinnedConversationKeys(chats: ChatApi[]) {
  const notesKey = getNotesConversationKey(chats);
  const pinnedKeys = chats.flatMap(getPinnedConversationKey);

  return [...pinnedKeys].sort(
    createNotesFirstPinnedConversationComparator(notesKey),
  );
}

function getNotesConversationKey(chats: ChatApi[]) {
  const notesChat = chats.find(isNotesChat);

  return notesChat ? getActivityConversationKey("dm", notesChat.id) : null;
}

function isNotesChat(chat: ChatApi) {
  return chat.type === "NOTES";
}

function getPinnedConversationKey(chat: ChatApi) {
  if (!chat.isPinned) {
    return [];
  }

  if (chat.type === "GROUP") {
    return chat.groupId
      ? [getActivityConversationKey("group", chat.groupId)]
      : [];
  }

  return [getActivityConversationKey("dm", chat.id)];
}

function createNotesFirstPinnedConversationComparator(notesKey: string | null) {
  if (!notesKey) {
    return () => 0;
  }

  return (left: string, right: string) =>
    getPinnedConversationSortRank(left, notesKey) -
    getPinnedConversationSortRank(right, notesKey);
}

function getPinnedConversationSortRank(key: string, notesKey: string) {
  return key === notesKey ? 0 : 1;
}

function mapSavedMessages(
  items: SavedMessageApi[],
  currentUserId: string,
): SavedMessageSnapshot[] {
  return items
    .map((item) => mapSavedMessageApi(item, currentUserId))
    .filter((item): item is SavedMessageSnapshot => item !== null)
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
}

function getSavedMessagesById(savedMessages: SavedMessageSnapshot[]) {
  return savedMessages.reduce<Record<string, SavedMessageSnapshot>>(
    (byId, snapshot) => {
      byId[snapshot.message.id] = snapshot;
      return byId;
    },
    {},
  );
}
