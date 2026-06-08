import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  exploreJoinResultSchema,
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
    const response = await apiClient.post(`explore/groups/${groupId}/join`);

    return parseJsonWithRequestId(response, (value) =>
      exploreJoinResultSchema.parse(value),
    );
  }
}
