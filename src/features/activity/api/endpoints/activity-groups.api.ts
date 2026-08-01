import {
  type CreateGroupPlanPayload,
  DEFAULT_ACTIVITY_API_LIMIT,
  type GroupMutationResult,
  paginatedGroupsSchema,
  type UpdateGroupPayload,
  updatePlanPayloadSchema,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  getGroupById as sharedGetGroupById,
  leaveGroup as sharedLeaveGroup,
  removeGroupMember as sharedRemoveGroupMember,
  updateGroup as sharedUpdateGroup,
} from "@/shared/api/group-membership-api";
import { groupApiSchema } from "@/shared/schemas";

export async function getGroups() {
  const response = await apiClient
    .get("groups/activity-feed", {
      searchParams: {
        limit: DEFAULT_ACTIVITY_API_LIMIT,
      },
    })
    .json<unknown>();

  return paginatedGroupsSchema.parse(response).items;
}

export async function getGroup(groupId: string) {
  return sharedGetGroupById(groupId);
}

export async function updateActivityGroup(
  groupId: string,
  payload: UpdateGroupPayload,
): Promise<GroupMutationResult> {
  return sharedUpdateGroup(groupId, payload);
}

export async function leaveActivityGroup(groupId: string) {
  return sharedLeaveGroup(groupId);
}

export async function removeGroupMember(groupId: string, memberId: string) {
  return sharedRemoveGroupMember(groupId, memberId);
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
