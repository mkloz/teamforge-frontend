import { queryOptions } from "@tanstack/react-query";

import { getUserOceanScores } from "@/features/profile/lib/profile-utils";
import type { ExploreGroup, User } from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

import { ExploreApi } from "./explore.api";
import type { ExploreFilters } from "../schemas/explore-filters.schema";

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

function filterExploreGroups(groups: ExploreGroup[], filters: ExploreFilters) {
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

    return categoryMatch && locationMatch && accessMatch && sizeMatch;
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

  static groups(filters: ExploreFilters) {
    return queryOptions({
      queryKey: [
        "explore-groups",
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

        const groups = await ExploreApi.getGroups(searchParams);
        const filteredGroups = filterExploreGroups(groups, filters);

        return sortExploreGroups(filteredGroups, filters.sortBy);
      },
      staleTime: 60_000,
    });
  }

  static joinGroup(groupId: string) {
    return ExploreApi.joinGroup(groupId);
  }
}
