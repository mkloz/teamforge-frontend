import type { activityQueries } from "@/features/activity/api/activity-queries";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";

export type ActivityFeedData = ReturnType<
  typeof activityQueries.deriveFeedData
>;
export type ActivityFeedFilter = Parameters<
  typeof activityQueries.deriveFeedData
>[0];
export type ActivityGroupsData = Parameters<
  typeof activityQueries.deriveFeedData
>[2];
export type ActivityChatsData = Parameters<
  typeof activityQueries.deriveFeedData
>[3];
export type ActivityFriendshipsData = Parameters<
  typeof activityQueries.deriveFeedData
>[4];
export type ActivityCurrentUserData = Parameters<
  typeof activityQueries.deriveFeedData
>[5];
export type ActivityTypingByChatId = Parameters<
  typeof activityQueries.deriveFeedData
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

export type ActivityFeedStatusOptions = {
  activeFilter: ActivityFeedFilter;
  chatsQuery: ActivityFeedStatusQueryState;
  currentUserQuery: ActivityFeedStatusQueryState;
  feedData: ActivityFeedData | null;
  friendshipsQuery: ActivityFeedStatusQueryState;
  groupsQuery: ActivityFeedStatusQueryState;
  needsFriendshipData: boolean;
  savedMessagesQuery: ActivityFeedSavedMessagesStatusQueryState;
};

export type ActivityFeedStatus = {
  isFeedError: boolean;
  isFeedRetrying: boolean;
  isInitialLoading: boolean;
  isSavedMessagesError: boolean;
  isSavedMessagesLoading: boolean;
  isSavedMessagesRetrying: boolean;
};

export type LoadedFeedDataOptions = {
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

export type LoadedFeedRequiredData = {
  chats: ActivityChatsData;
  currentUser: ActivityCurrentUserData;
  friendships: ActivityFriendshipsData;
  groups: ActivityGroupsData;
};

export type LoadedFeedCoreData = Omit<LoadedFeedRequiredData, "friendships">;

export type ActivityFeedReturnStateOptions = {
  chats: ActivityChatsData | undefined;
  feedData: ActivityFeedData | null;
  refetchFeedQueries: () => Promise<void>;
  refetchSavedMessages: () => Promise<void>;
  savedMessages: SavedMessageSnapshot[];
  savedMessagesById: Record<string, SavedMessageSnapshot>;
  status: ActivityFeedStatus;
};
