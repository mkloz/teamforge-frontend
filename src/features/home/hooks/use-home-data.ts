import { useQuery } from "@tanstack/react-query";
import {
  MOCK_INVITATIONS,
  MOCK_RECOMMENDED_GROUPS,
  MOCK_UPCOMING_PLANS,
  MOCK_USER_GROUPS,
  MOCK_USER_STATS,
} from "../data/mock-home";

/**
 * Hook to fetch all home page data.
 * Currently uses mock data but is structured to use TanStack Query
 * for easy transition to real API endpoints.
 */
export function useHomeData() {
  const statsQuery = useQuery({
    queryKey: ["home", "stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_USER_STATS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const plansQuery = useQuery({
    queryKey: ["home", "plans"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return MOCK_UPCOMING_PLANS;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const groupsQuery = useQuery({
    queryKey: ["home", "groups"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_USER_GROUPS;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const invitationsQuery = useQuery({
    queryKey: ["home", "invitations"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return MOCK_INVITATIONS;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const recommendationsQuery = useQuery({
    queryKey: ["home", "recommendations"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_RECOMMENDED_GROUPS;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    stats: statsQuery.data ?? MOCK_USER_STATS,
    plans: plansQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    invitations: invitationsQuery.data ?? [],
    recommendations: recommendationsQuery.data ?? [],
    isLoading:
      statsQuery.isLoading ||
      plansQuery.isLoading ||
      groupsQuery.isLoading ||
      invitationsQuery.isLoading ||
      recommendationsQuery.isLoading,
    isError:
      statsQuery.isError ||
      plansQuery.isError ||
      groupsQuery.isError ||
      invitationsQuery.isError ||
      recommendationsQuery.isError,
    refetchAll: () => {
      statsQuery.refetch();
      plansQuery.refetch();
      groupsQuery.refetch();
      invitationsQuery.refetch();
      recommendationsQuery.refetch();
    },
  };
}
