import { apiClient } from "@/shared/api/api";

type ExploreFeedSearchParams =
  | URLSearchParams
  | Record<string, boolean | number | string>;

export async function getExploreFeedResponse(
  searchParams: ExploreFeedSearchParams,
) {
  return apiClient
    .get("explore/feed", {
      searchParams,
    })
    .json<unknown>();
}
