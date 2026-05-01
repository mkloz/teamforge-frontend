import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
  invalidateNotificationSurfaces,
} from "@/shared/api/query-invalidation";

import { ExploreApi } from "@/features/explore/api/explore.api";
import { ExploreCache } from "@/features/explore/api/explore-cache";

export const ExploreCommands = {
  async joinGroup(groupId: string) {
    const result = await ExploreApi.joinGroup(groupId);

    ExploreCache.removeJoinedGroup(result.data);

    await invalidateGroupMembershipSurfaces();

    return result;
  },

  async acceptFriendRequest(requesterId: string) {
    const friendship = await ExploreApi.acceptFriendRequest(requesterId);

    ExploreCache.applyFriendRequestUpdate(friendship.data);

    void Promise.all([
      invalidateNotificationSurfaces(),
      invalidateFriendshipSurfaces(),
    ]);

    return friendship;
  },

  async declineFriendRequest(requesterId: string) {
    const friendship = await ExploreApi.declineFriendRequest(requesterId);

    ExploreCache.applyFriendRequestUpdate(friendship.data);

    void invalidateNotificationSurfaces();

    return friendship;
  },
};
