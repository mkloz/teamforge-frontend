import type { ForgeExecutionResult } from "@/features/forge/api/forge-types";
import { mapGroupToParticipants } from "@/features/forge/lib/forge-participant-mappers";
import type { GroupApi } from "@/shared/schemas";

type ForgeRequestIds = ForgeExecutionResult["requestIds"];

interface FailedForgeResultOverrides {
  activityId?: string | null;
  groupId?: string | null;
  chatId?: string | null;
  planId?: string | null;
  requestIds?: ForgeRequestIds;
}

interface SuccessfulForgeResultInput {
  activityId: string;
  chatId: string;
  currentUserId: string;
  group: GroupApi;
  planId: string;
  requestIds: ForgeRequestIds;
}

export function buildFailedForgeResult({
  activityId = null,
  chatId = null,
  groupId = null,
  planId = null,
  requestIds,
}: FailedForgeResultOverrides = {}): ForgeExecutionResult {
  return {
    forgeResult: "FAILED",
    participants: [],
    activityId,
    groupId,
    chatId,
    planId,
    requestIds: getFailedForgeRequestIds(requestIds),
  };
}

function getFailedForgeRequestIds(requestIds: ForgeRequestIds | undefined) {
  return (
    requestIds ?? {
      autoForgeRequest: null,
      createActivity: null,
      forgeActivity: null,
    }
  );
}

export function buildSuccessfulForgeResult({
  activityId,
  chatId,
  currentUserId,
  group,
  planId,
  requestIds,
}: SuccessfulForgeResultInput): ForgeExecutionResult {
  return {
    forgeResult: "SUCCESS",
    participants: mapGroupToParticipants(group, currentUserId),
    activityId,
    groupId: group.id,
    chatId,
    planId,
    requestIds,
  };
}
