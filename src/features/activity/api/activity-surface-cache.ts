import { ActivityChatSummaryCache } from "./cache/activity-chat-summary-cache";
import { ActivityFriendshipCache } from "./cache/activity-friendship-cache";
import { ActivityGroupCache } from "./cache/activity-group-cache";
import { ActivityPinnedMessageCache } from "./cache/activity-pinned-message-cache";
import { ActivityPresenceCache } from "./cache/activity-presence-cache";

export const ActivitySurfaceCache = {
  applyFriendshipUpdate: ActivityFriendshipCache.applyFriendshipUpdate,
  applyPresenceChanged: ActivityPresenceCache.applyPresenceChanged,
  applyRealtimeGroupUpdate: ActivityGroupCache.applyRealtimeGroupUpdate,
  removeFriendshipFromActivity:
    ActivityFriendshipCache.removeFriendshipFromActivity,
  removePinnedMessage: ActivityPinnedMessageCache.removePinnedMessage,
  syncPinnedMessage: ActivityPinnedMessageCache.syncPinnedMessage,
  updateChatLastMessage: ActivityChatSummaryCache.updateChatLastMessage,
  updateChatSummary: ActivityChatSummaryCache.updateChatSummary,
};
