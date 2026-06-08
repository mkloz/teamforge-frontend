import { useQuery } from "@tanstack/react-query";
import { ProfileFriendsQueryFactory } from "@/features/profile/api/profile-query-options";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function useProfileOutgoingFriendRequests() {
  const requestsQuery = useQuery(
    ProfileFriendsQueryFactory.outgoingFriendRequests(),
  );
  const { isOnline } = useOfflineActionGuard();

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    isOnline,
  };
}
