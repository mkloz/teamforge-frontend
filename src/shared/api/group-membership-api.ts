import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  exploreJoinRequestCancelResultSchema,
  exploreJoinResultSchema,
} from "@/shared/schemas";

export async function postExploreGroupJoin(groupId: string) {
  const response = await apiClient.post(`explore/groups/${groupId}/join`);

  return parseJsonWithRequestId(response, (value) =>
    exploreJoinResultSchema.parse(value),
  );
}

export async function postExploreGroupJoinRequestCancel(groupId: string) {
  const response = await apiClient.post(
    `explore/groups/${groupId}/cancel-request`,
  );

  return parseJsonWithRequestId(response, (value) =>
    exploreJoinRequestCancelResultSchema.parse(value),
  );
}
