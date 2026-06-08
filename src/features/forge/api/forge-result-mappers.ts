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
  searchKept?: boolean;
}

interface SuccessfulForgeResultInput {
  activityId: string;
  chatId: string;
  currentUserId: string;
  group: GroupApi;
  planId: string;
  requestIds: ForgeRequestIds;
}

export function buildFailedForgeResult(
  overrides: FailedForgeResultOverrides = {},
): ForgeExecutionResult {
  return {
    forgeResult: "FAILED",
    participants: [],
    activityId: overrides.activityId ?? null,
    groupId: overrides.groupId ?? null,
    chatId: overrides.chatId ?? null,
    planId: overrides.planId ?? null,
    searchKept: overrides.searchKept,
    requestIds: overrides.requestIds ?? {
      createActivity: null,
      forgeActivity: null,
    },
  };
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
