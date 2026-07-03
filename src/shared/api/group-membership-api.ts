import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  exploreJoinRequestCancelResultSchema,
  exploreJoinResultSchema,
  groupApiSchema,
  updateGroupPayloadSchema,
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

export async function getGroupById(groupId: string) {
  const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

  return groupApiSchema.parse(response);
}

export async function leaveGroup(groupId: string) {
  const response = await apiClient.post(`groups/${groupId}/leave`);

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}

export async function updateGroup(groupId: string, payload: unknown) {
  const response = await apiClient.patch(`groups/${groupId}`, {
    json: updateGroupPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}
