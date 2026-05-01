import { ExploreQueryOptions } from "@/features/explore/api/explore-query-options";
import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";

export const ExploreQueryFactory = {
  groups(filters: ExploreFilters, searchQuery: string) {
    return ExploreQueryOptions.groups(filters, searchQuery);
  },

  friendRequests() {
    return ExploreQueryOptions.friendRequests();
  },
};
