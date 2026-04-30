import { queryOptions } from "@tanstack/react-query";

import { getUserOceanScores } from "@/features/profile/lib/profile-utils";
import type { ApiResponseWithRequestId } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";
import type {
  ExploreGroup,
  ExploreJoinResult,
  FriendshipApi,
  User,
} from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

import { ExploreApi } from "./explore.api";
import type { ExploreFilters } from "../schemas/explore-filters.schema";

export const EXPLORE_FRIEND_REQUESTS_QUERY_KEY = [
  "explore",
  "friend-requests",
] as const;

export interface ExploreIdentity {
  mbti: string;
  trustScore: number;
  oceanScores: OceanScores;
}

function normalizeScore(score: number) {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

function filterExploreGroups(
  groups: ExploreGroup[],
  filters: ExploreFilters,
  searchQuery: string,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return groups.filter((group) => {
    const plan = group.plan;
    const groupCategory = plan?.category || "OTHER";
    const categoryMatch =
      filters.selectedCategories.includes("ALL") ||
      filters.selectedCategories.includes(groupCategory);

    const locationMatch =
      filters.locationMode === "ALL" ||
      plan?.locationMode === filters.locationMode;

    const accessMatch =
      filters.access === "ALL" || group.access === filters.access;

    const sizeMatch =
      group.activeMembersCount >= filters.sizeRange[0] &&
      group.maxMembers <= filters.sizeRange[1];
    const textMatch =
      normalizedSearch.length === 0 ||
      [group.name, group.description, group.activity.title, plan?.title]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch));

    return (
      categoryMatch && locationMatch && accessMatch && sizeMatch && textMatch
    );
  });
}

function sortExploreGroups(
  groups: ExploreGroup[],
  sortBy: ExploreFilters["sortBy"],
) {
  const nextGroups = [...groups];

  if (sortBy === "MATCH") {
    return nextGroups.sort(
      (left, right) => right.compatibility.total - left.compatibility.total,
    );
  }

  if (sortBy === "SOONEST") {
    return nextGroups.sort((left, right) => {
      const leftTime = left.plan?.dateTime
        ? new Date(left.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightTime = right.plan?.dateTime
        ? new Date(right.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;

      return leftTime - rightTime;
    });
  }

  return nextGroups;
}

function getServerCategory(
  selectedCategories: ExploreFilters["selectedCategories"],
) {
  const categories = selectedCategories.filter(
    (category) => category !== "ALL",
  );

  return categories.length === 1 ? categories[0] : undefined;
}

function getFriendshipVersion(friendship: FriendshipApi) {
  return friendship.version ?? new Date(friendship.updatedAt).getTime();
}

function mergeFriendships(
  current: FriendshipApi[] | undefined,
  incoming: FriendshipApi,
) {
  const existing = current?.find(
    (item) =>
      item.requesterId === incoming.requesterId &&
      item.receiverId === incoming.receiverId,
  );
  const nextFriendship =
    existing && getFriendshipVersion(existing) > getFriendshipVersion(incoming)
      ? existing
      : incoming;
  const withoutExisting =
    current?.filter(
      (item) =>
        !(
          item.requesterId === incoming.requesterId &&
          item.receiverId === incoming.receiverId
        ),
    ) ?? [];

  return [nextFriendship, ...withoutExisting].sort(
    (left, right) => getFriendshipVersion(right) - getFriendshipVersion(left),
  );
}

export class ExploreQueries {
  static getIdentity(user?: User | null): ExploreIdentity | null {
    if (!user) {
      return null;
    }

    if (!user.personalityType) {
      return null;
    }

    const oceanScores = getUserOceanScores(user);

    if (!oceanScores) {
      return null;
    }

    return {
      mbti: user.personalityType,
      trustScore: normalizeScore(user.trustScore),
      oceanScores,
    };
  }

  static groups(filters: ExploreFilters, searchQuery: string) {
    return queryOptions({
      queryKey: [
        "explore-groups",
        searchQuery,
        filters.selectedCategories,
        filters.sizeRange,
        filters.distance,
        filters.locationMode,
        filters.access,
        filters.sortBy,
      ],
      queryFn: async (): Promise<ExploreGroup[]> => {
        const searchParams = new URLSearchParams();
        const serverCategory = getServerCategory(filters.selectedCategories);

        searchParams.set("limit", "24");

        if (serverCategory) {
          searchParams.set("category", serverCategory);
        }

        if (filters.access !== "ALL") {
          searchParams.set("access", filters.access);
        }

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }

        const groups = await ExploreApi.getGroups(searchParams);
        const filteredGroups = filterExploreGroups(
          groups,
          filters,
          searchQuery,
        );

        return sortExploreGroups(filteredGroups, filters.sortBy);
      },
      staleTime: 60_000,
    });
  }

  static joinGroup(groupId: string) {
    return ExploreApi.joinGroup(groupId).then(async (result) => {
      this.applyJoinGroupResult(result.data);

      await Promise.all([
        appQueryClient.invalidateQueries({ queryKey: ["home", "groups"] }),
        appQueryClient.invalidateQueries({ queryKey: ["home", "plans"] }),
        appQueryClient.invalidateQueries({ queryKey: ["home", "stats"] }),
      ]);

      return result;
    });
  }

  static friendRequests() {
    return queryOptions({
      queryKey: EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
      queryFn: () => ExploreApi.getIncomingFriendRequests(),
      staleTime: 30_000,
    });
  }

  static async acceptFriendRequest(requesterId: string) {
    const friendship = await ExploreApi.acceptFriendRequest(requesterId);

    this.applyFriendRequestUpdate(friendship.data);

    void Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: ["notifications"],
      }),
      appQueryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      }),
    ]);

    return friendship;
  }

  static async declineFriendRequest(requesterId: string) {
    const friendship = await ExploreApi.declineFriendRequest(requesterId);

    this.applyFriendRequestUpdate(friendship.data);

    void Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: ["notifications"],
      }),
      appQueryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      }),
    ]);

    return friendship;
  }

  static applyFriendRequestUpdate(friendship: FriendshipApi) {
    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
      (current) => {
        const merged = mergeFriendships(current, friendship);
        return merged.filter((item) => item.status === "PENDING");
      },
    );

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      ["activity", "friendships"],
      (current) => mergeFriendships(current, friendship),
    );
  }

  static applyJoinGroupResult(
    result: ExploreJoinResult | ApiResponseWithRequestId<ExploreJoinResult>,
  ) {
    const nextResult = "data" in result ? result.data : result;

    for (const [queryKey, groups] of appQueryClient.getQueriesData<
      ExploreGroup[]
    >({
      queryKey: ["explore-groups"],
    })) {
      if (!groups) {
        continue;
      }

      appQueryClient.setQueryData<ExploreGroup[]>(
        queryKey,
        groups.filter((group) => group.id !== nextResult.groupId),
      );
    }
  }
}
