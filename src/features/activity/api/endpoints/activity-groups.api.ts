import {
  type CreateGroupPlanPayload,
  DEFAULT_ACTIVITY_API_LIMIT,
  type GroupMutationResult,
  paginatedGroupsSchema,
  type UpdateGroupPayload,
  updateGroupPayloadSchema,
  updatePlanPayloadSchema,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { groupApiSchema } from "@/shared/schemas";

export async function getGroups() {
  const response = await apiClient
    .get("groups", {
      searchParams: {
        limit: DEFAULT_ACTIVITY_API_LIMIT,
      },
    })
    .json<unknown>();

  return paginatedGroupsSchema.parse(response).items;
}

export async function getGroup(groupId: string) {
  const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

  return groupApiSchema.parse(response);
}

export async function updateGroup(
  groupId: string,
  payload: UpdateGroupPayload,
): Promise<GroupMutationResult> {
  const response = await apiClient.patch(`groups/${groupId}`, {
    json: updateGroupPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}

export async function leaveGroup(groupId: string) {
  const response = await apiClient.post(`groups/${groupId}/leave`);

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}

export async function removeGroupMember(groupId: string, memberId: string) {
  const response = await apiClient.post(`groups/${groupId}/remove-member`, {
    json: { memberId },
  });

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}

export async function disbandGroup(groupId: string) {
  const response = await apiClient.post(`groups/${groupId}/disband`);

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}

export async function createNextGroupPlan(
  groupId: string,
  payload: CreateGroupPlanPayload,
) {
  const response = await apiClient.post(`groups/${groupId}/plans`, {
    json: updatePlanPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    groupApiSchema.parse(value),
  );
}
