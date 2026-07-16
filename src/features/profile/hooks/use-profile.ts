import { useQuery } from "@tanstack/react-query";
import { publicProfileQueryOptions } from "@/features/profile/api/profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";

export function useProfile() {
  const currentUserQuery = useCurrentUserQuery();

  return {
    profile: currentUserQuery.data ?? null,
    isLoading: currentUserQuery.isLoading,
    error: currentUserQuery.error,
    refetch: currentUserQuery.refetch,
  };
}

export function usePublicProfile(userId: string) {
  const publicProfileQuery = useQuery({
    ...publicProfileQueryOptions(userId),
    enabled: Boolean(userId),
  });

  return {
    profile: publicProfileQuery.data ?? null,
    isLoading: publicProfileQuery.isLoading,
    error: publicProfileQuery.error,
    refetch: publicProfileQuery.refetch,
  };
}
