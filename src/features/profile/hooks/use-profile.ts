import { useQuery } from "@tanstack/react-query";
import { publicProfileQueryOptions } from "@/features/profile/api/profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";

export function useProfile(userId?: string) {
  const currentUserQuery = useCurrentUserQuery();
  const publicProfileQuery = useQuery({
    ...publicProfileQueryOptions(userId ?? ""),
    enabled: !!userId,
  });

  const profile: User | null = userId
    ? (publicProfileQuery.data ?? null)
    : (currentUserQuery.data ?? null);

  return {
    profile,
    isLoading: userId
      ? publicProfileQuery.isLoading
      : currentUserQuery.isLoading,
    error: userId ? publicProfileQuery.error : currentUserQuery.error,
    refetch: userId ? publicProfileQuery.refetch : currentUserQuery.refetch,
  };
}
