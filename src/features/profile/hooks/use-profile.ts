import { useQuery } from "@tanstack/react-query";
import { publicProfileQueryOptions } from "@/features/profile/api/profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";

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

  const profile: User | null = publicProfileQuery.data ?? null;

  return {
    profile,
    isLoading: publicProfileQuery.isLoading,
    error: publicProfileQuery.error,
    refetch: publicProfileQuery.refetch,
  };
}
