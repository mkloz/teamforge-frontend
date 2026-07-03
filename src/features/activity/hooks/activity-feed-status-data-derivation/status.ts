import type {
  ActivityFeedData,
  ActivityFeedFilter,
  ActivityFeedSavedMessagesStatusQueryState,
  ActivityFeedStatus,
  ActivityFeedStatusOptions,
} from "@/features/activity/hooks/activity-feed-status-data-derivation/types";

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
