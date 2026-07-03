import { activityQueries } from "@/features/activity/api/activity-queries";
import type {
  ActivityFriendshipsData,
  LoadedFeedCoreData,
  LoadedFeedDataOptions,
  LoadedFeedRequiredData,
} from "@/features/activity/hooks/activity-feed-status-data-derivation/types";

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

  return activityQueries.deriveFeedData(
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
