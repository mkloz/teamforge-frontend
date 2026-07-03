import type {
  ActivityFeedQueries,
  SavedMessagesQuery,
} from "@/features/activity/hooks/activity-feed-derived-state/queries";

export function createActivityFeedRefetchers(
  {
    chatsQuery,
    currentUserQuery,
    friendshipsQuery,
    groupsQuery,
  }: ActivityFeedQueries,
  savedMessagesQuery: SavedMessagesQuery,
) {
  async function refetchFeedQueries() {
    await Promise.allSettled([
      currentUserQuery.refetch(),
      groupsQuery.refetch(),
      chatsQuery.refetch(),
      friendshipsQuery.refetch(),
      savedMessagesQuery.refetch(),
    ]);
  }

  async function refetchSavedMessages() {
    await savedMessagesQuery.refetch();
  }

  return {
    refetchFeedQueries,
    refetchSavedMessages,
  };
}
