import { apiClient } from "@/shared/api/api";

type ExploreGroupsSearchParams =
  | URLSearchParams
  | Record<string, boolean | number | string>;

export async function getExploreGroupsResponse(
  searchParams: ExploreGroupsSearchParams,
) {
  return apiClient
    .get("explore/groups", {
      searchParams,
    })
    .json<unknown>();
}
