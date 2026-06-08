import { queryOptions } from "@tanstack/react-query";
import { ProfileApi } from "@/features/profile/api/profile.api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function publicProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
    queryFn: () => ProfileApi.getUserProfile(userId),
    staleTime: 60_000,
  });
}

export function profileFriendshipQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.friendshipWith(userId),
    queryFn: () => ProfileApi.getFriendshipWithUser(userId),
    staleTime: 30_000,
  });
}

export const ProfileFriendsQueryFactory = {
  friendRequests() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.profile.friendRequests,
      queryFn: () => ProfileApi.getIncomingFriendRequests(),
      staleTime: 30_000,
    });
  },

  outgoingFriendRequests() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.profile.outgoingFriendRequests,
      queryFn: () => ProfileApi.getOutgoingFriendRequests(),
      staleTime: 30_000,
    });
  },

  friends() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.profile.friends,
      queryFn: () => ProfileApi.getFriends(),
      staleTime: 60_000,
    });
  },

  commonFriends: (userId: string) =>
    queryOptions({
      queryKey: [...APP_QUERY_KEYS.profile.friends, "common", userId],
      queryFn: () => ProfileApi.getCommonFriends(userId),
      staleTime: 60_000,
      enabled: !!userId,
    }),

  publicFriends: (userId: string) =>
    queryOptions({
      queryKey: [...APP_QUERY_KEYS.profile.friends, "public", userId],
      queryFn: () => ProfileApi.getPublicFriends(userId),
      staleTime: 60_000,
      enabled: !!userId,
    }),
};
