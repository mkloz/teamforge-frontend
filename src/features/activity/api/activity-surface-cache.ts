import { ActivityChatSummaryCache } from "./cache/activity-chat-summary-cache";
import { ActivityFriendshipCache } from "./cache/activity-friendship-cache";
import { ActivityGroupCache } from "./cache/activity-group-cache";
import { ActivityPinnedMessageCache } from "./cache/activity-pinned-message-cache";
import { ActivityPresenceCache } from "./cache/activity-presence-cache";

export const ActivitySurfaceCache = {
  applyFriendshipUpdate: (
    ...args: Parameters<typeof ActivityFriendshipCache.applyFriendshipUpdate>
  ) => ActivityFriendshipCache.applyFriendshipUpdate(...args),
  applyPresenceChanged: (
    ...args: Parameters<typeof ActivityPresenceCache.applyPresenceChanged>
  ) => ActivityPresenceCache.applyPresenceChanged(...args),
  applyRealtimeGroupUpdate: (
    ...args: Parameters<typeof ActivityGroupCache.applyRealtimeGroupUpdate>
  ) => ActivityGroupCache.applyRealtimeGroupUpdate(...args),
  removeFriendshipFromActivity: (
    ...args: Parameters<
      typeof ActivityFriendshipCache.removeFriendshipFromActivity
    >
  ) => ActivityFriendshipCache.removeFriendshipFromActivity(...args),
  removePinnedMessage: (
    ...args: Parameters<typeof ActivityPinnedMessageCache.removePinnedMessage>
  ) => ActivityPinnedMessageCache.removePinnedMessage(...args),
  markChatRead: (
    ...args: Parameters<typeof ActivityChatSummaryCache.markChatRead>
  ) => ActivityChatSummaryCache.markChatRead(...args),
  syncPinnedMessage: (
    ...args: Parameters<typeof ActivityPinnedMessageCache.syncPinnedMessage>
  ) => ActivityPinnedMessageCache.syncPinnedMessage(...args),
  updateChatLastMessage: (
    ...args: Parameters<typeof ActivityChatSummaryCache.updateChatLastMessage>
  ) => ActivityChatSummaryCache.updateChatLastMessage(...args),
  updateChatSummary: (
    ...args: Parameters<typeof ActivityChatSummaryCache.updateChatSummary>
  ) => ActivityChatSummaryCache.updateChatSummary(...args),
};
