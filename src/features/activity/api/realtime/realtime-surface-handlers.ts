import { ActivitySurfaceCache } from "@/features/activity/api/activity-surface-cache";
import type { ActivityRealtimeContext } from "@/features/activity/api/realtime/activity-realtime-types";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  OnlineStatus,
} from "@/shared/schemas";

export function applyRealtimeChatRead(
  context: ActivityRealtimeContext,
  chat: ChatApi,
) {
  context.updateChatSummaryCache(chat);
}

export function applyRealtimePresenceChanged(
  userId: string,
  onlineStatus: OnlineStatus,
  lastSeenAt: string | null,
) {
  ActivitySurfaceCache.applyPresenceChanged(userId, onlineStatus, lastSeenAt);
}

export function applyRealtimeFriendshipUpdate(
  context: ActivityRealtimeContext,
  friendship: FriendshipApi,
) {
  ActivitySurfaceCache.applyFriendshipUpdate({
    friendship,
    mergeFriendshipList: (current, incoming) =>
      context.mergeFriendshipList(current, incoming),
  });
}

export function removeRealtimeFriendshipFromActivity(
  context: ActivityRealtimeContext,
  friendship: FriendshipApi,
) {
  ActivitySurfaceCache.removeFriendshipFromActivity({
    friendship,
    isSameFriendshipPair: (requesterId, receiverId, incoming) =>
      context.isSameFriendshipPair(requesterId, receiverId, incoming),
  });
}

export function applyRealtimeGroupUpdate(
  context: ActivityRealtimeContext,
  currentUserId: string,
  group: GroupApi,
) {
  ActivitySurfaceCache.applyRealtimeGroupUpdate({
    currentUserId,
    getGroupVersion: (incomingGroup) => context.getGroupVersion(incomingGroup),
    group,
    mapApiGroupFromSelection: (selectionGroup, baseGroup) =>
      context.mapApiGroupFromSelection(selectionGroup, baseGroup),
    mapGroup: (incomingGroup, userId, proposals, chatSummary) =>
      context.mapGroup(incomingGroup, userId, proposals, chatSummary),
  });
}
