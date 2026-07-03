import { getExploreGroupsResponse } from "@/shared/api/explore-groups-api";
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
    const response = await getExploreGroupsResponse(searchParams);

    return paginatedExploreGroupsSchema.parse(response);
  }

  static async joinGroup(groupId: string) {
    return postExploreGroupJoin(groupId);
  }
}
