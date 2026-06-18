import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import {
  mapSavedMessageApi,
  type SavedMessageSnapshot,
} from "@/features/activity/lib/saved-message";
import type { ChatApi, SavedMessageApi } from "@/shared/schemas";

export type ActivityFeedData = ReturnType<
  typeof ActivityQueryFactory.deriveFeedData
>;
export type ActivityFeedFilter = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[0];
export type ActivityGroupsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[2];
export type ActivityChatsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[3];
export type ActivityFriendshipsData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[4];
export type ActivityCurrentUserData = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[5];
export type ActivityTypingByChatId = Parameters<
  typeof ActivityQueryFactory.deriveFeedData
>[6];

export type ActivityFeedStatusQueryState = {
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
};

export type ActivityFeedSavedMessagesStatusQueryState =
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
  if (
    !currentUser ||
    !groups ||
    !chats ||
    (needsFriendshipData && !friendships)
  ) {
    return null;
  }

  return ActivityQueryFactory.deriveFeedData(
    activeFilter,
    deferredSearchQuery,
    groups,
    chats,
    friendships ?? [],
    currentUser,
    typingByChatId,
    {
      pinnedConversationKeys,
      savedMessagesById,
    },
  );
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

  return [...pinnedKeys].sort((left, right) => {
    if (!notesKey) {
      return 0;
    }

    if (left === notesKey && right !== notesKey) {
      return -1;
    }

    if (right === notesKey && left !== notesKey) {
      return 1;
    }

    return 0;
  });
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
