import { apiClient } from "@/shared/api/api";
import { postExploreGroupJoin } from "@/shared/api/group-membership-api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  exploreViewInsightSchema,
} from "@/shared/schemas";

const paginatedExploreGroupsSchema = createPaginatedSchema(
  exploreGroupSchema,
).extend({
  insight: exploreViewInsightSchema,
});

export class ExploreApi {
  static async getGroups(searchParams: URLSearchParams) {
    const response = await apiClient
      .get("explore/groups", {
        searchParams,
      })
      .json<unknown>();

    return paginatedExploreGroupsSchema.parse(response);
  }

  static async joinGroup(groupId: string) {
    return postExploreGroupJoin(groupId);
  }
}
