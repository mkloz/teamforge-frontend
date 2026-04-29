import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  exploreJoinResultSchema,
} from "@/shared/schemas";

const paginatedExploreGroupsSchema = createPaginatedSchema(exploreGroupSchema);

export class ExploreApi {
  static async getGroups(searchParams: URLSearchParams) {
    const response = await apiClient
      .get("explore/groups", {
        searchParams,
      })
      .json<unknown>();

    return paginatedExploreGroupsSchema.parse(response).items;
  }

  static async joinGroup(groupId: string) {
    const response = await apiClient
      .post(`explore/groups/${groupId}/join`)
      .json<unknown>();

    return exploreJoinResultSchema.parse(response);
  }
}
