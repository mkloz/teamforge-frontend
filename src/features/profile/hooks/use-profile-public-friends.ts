import { useQuery } from "@tanstack/react-query";
import { ProfileFriendsQueryFactory } from "@/features/profile/api/profile-query-options";

export function useProfilePublicFriends(userId: string) {
  const query = useQuery(ProfileFriendsQueryFactory.publicFriends(userId));

  return {
    publicFriends: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
