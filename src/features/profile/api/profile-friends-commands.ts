import { ProfileApi } from "@/features/profile/api/profile.api";
import { ProfileFriendsCache } from "@/features/profile/api/profile-friends-cache";
import {
  invalidateFriendshipSurfaces,
  invalidateNotificationSurfaces,
} from "@/shared/api/query-invalidation";

export const ProfileFriendsCommands = {
  async acceptFriendRequest(requesterId: string) {
    const friendship = await ProfileApi.acceptFriendRequest(requesterId);

    ProfileFriendsCache.applyFriendRequestUpdate(friendship.data);

    await Promise.all([
      invalidateNotificationSurfaces(),
      invalidateFriendshipSurfaces(),
    ]);

    return friendship;
  },

  async declineFriendRequest(requesterId: string) {
    const friendship = await ProfileApi.declineFriendRequest(requesterId);

    ProfileFriendsCache.applyFriendRequestUpdate(friendship.data);

    await invalidateNotificationSurfaces();

    return friendship;
  },

  async removeFriend(friendId: string) {
    const friendship = await ProfileApi.removeFriend(friendId);

    ProfileFriendsCache.applyFriendRequestUpdate(friendship.data);

    await invalidateFriendshipSurfaces();

    return friendship;
  },
};
