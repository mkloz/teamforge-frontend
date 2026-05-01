import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";
import { publicProfileQueryOptions } from "@/features/profile/api/profile-query-options";

export function useProfile(userId?: string) {
  const currentUserQuery = useCurrentUserQuery();
  const publicProfileQuery = useQuery({
    ...publicProfileQueryOptions(userId ?? ""),
    enabled: !!userId,
  });

  const profile = useMemo<User | null>(() => {
    if (userId) {
      return publicProfileQuery.data ?? null;
    }

    return currentUserQuery.data ?? null;
  }, [currentUserQuery.data, publicProfileQuery.data, userId]);

  return {
    profile,
    isLoading: userId
      ? publicProfileQuery.isLoading
      : currentUserQuery.isLoading,
    error: userId ? publicProfileQuery.error : currentUserQuery.error,
    refetch: userId ? publicProfileQuery.refetch : currentUserQuery.refetch,
  };
}
