import { useQuery } from "@tanstack/react-query";
import { ProfileFriendsQueryFactory } from "@/features/profile/api/profile-query-options";

export function useProfileCommonFriends(userId?: string) {
  const commonFriendsQuery = useQuery(
    ProfileFriendsQueryFactory.commonFriends(userId ?? ""),
  );

  return {
    commonFriends: commonFriendsQuery.data ?? [],
    isLoading: commonFriendsQuery.isLoading,
    isError: commonFriendsQuery.isError,
  };
}
