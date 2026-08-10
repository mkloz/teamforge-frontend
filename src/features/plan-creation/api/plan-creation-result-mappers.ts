import type { GroupFormationExecutionResult } from "@/features/plan-creation/api/plan-creation-types";
import { mapGroupToParticipants } from "@/features/plan-creation/lib/plan-creation-participant-mappers";
import type { GroupApi } from "@/shared/schemas";

type GroupFormationRequestIds = GroupFormationExecutionResult["requestIds"];

interface FailedGroupFormationResultOverrides {
  activityId?: string | null;
  automaticGroupFormationRequest?: GroupFormationExecutionResult["automaticGroupFormationRequest"];
  groupId?: string | null;
  chatId?: string | null;
  planId?: string | null;
  requestIds?: GroupFormationRequestIds;
}

interface SuccessfulGroupFormationResultInput {
  activityId: string;
  automaticGroupFormationRequest?: GroupFormationExecutionResult["automaticGroupFormationRequest"];
  chatId: string;
  currentUserId: string;
  group: GroupApi;
  planId: string;
  requestIds: GroupFormationRequestIds;
}

export function buildFailedGroupFormationResult({
  activityId = null,
  automaticGroupFormationRequest = null,
  chatId = null,
  groupId = null,
  planId = null,
  requestIds,
}: FailedGroupFormationResultOverrides = {}): GroupFormationExecutionResult {
  return {
    groupFormationResult: "FAILED",
    participants: [],
    activityId,
    automaticGroupFormationRequest,
    groupId,
    chatId,
    planId,
    requestIds: getFailedGroupFormationRequestIds(requestIds),
  };
}

function getFailedGroupFormationRequestIds(
  requestIds: GroupFormationRequestIds | undefined,
) {
  return (
    requestIds ?? {
      automaticGroupFormationRequest: null,
      createActivity: null,
      groupFormationActivity: null,
    }
  );
}

export function buildSuccessfulGroupFormationResult({
  activityId,
  automaticGroupFormationRequest = null,
  chatId,
  currentUserId,
  group,
  planId,
  requestIds,
}: SuccessfulGroupFormationResultInput): GroupFormationExecutionResult {
  return {
    groupFormationResult: "SUCCESS",
    participants: mapGroupToParticipants(group, currentUserId),
    activityId,
    automaticGroupFormationRequest,
    groupId: group.id,
    chatId,
    planId,
    requestIds,
  };
}
