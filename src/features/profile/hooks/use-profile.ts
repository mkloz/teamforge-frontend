import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthQueries } from "@/features/auth/api/auth.queries";
import type { User } from "@/shared/schemas";
import { ProfileQueries } from "../api/profile.queries";

export function useProfile(userId?: string) {
  const currentUserQuery = AuthQueries.useCurrentUser();
  const publicProfileQuery = useQuery({
    ...ProfileQueries.profile(userId ?? ""),
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
