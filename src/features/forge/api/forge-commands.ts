import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";

import { ForgeApi } from "@/features/forge/api/forge.api";
import type {
  AutoForgeExecutionInput,
  ForgeExecutionResult,
  SaveForgedIdentityInput,
  SendManualInvitesInput,
} from "@/features/forge/api/forge-types";
import {
  buildCreateActivityInput,
  buildForgeActivityInput,
} from "@/features/forge/lib/forge-activity-builders";
import { mapGroupToParticipants } from "@/features/forge/lib/forge-participant-mappers";

function buildFailedForgeResult(): ForgeExecutionResult {
  return {
    forgeResult: "FAILED",
    participants: [],
    activityId: null,
    groupId: null,
    chatId: null,
    planId: null,
    requestIds: {
      createActivity: null,
      forgeActivity: null,
    },
  };
}

async function getCurrentUser() {
  return appQueryClient.ensureQueryData(currentUserQueryOptions());
}

async function executeForge(
  input: AutoForgeExecutionInput,
  forgeMode: "AUTO" | "MANUAL",
): Promise<ForgeExecutionResult> {
  const currentUser = await getCurrentUser();
  const createActivityInput = buildCreateActivityInput(
    currentUser,
    input,
    forgeMode,
  );

  if (createActivityInput.interestIds.length === 0) {
    return buildFailedForgeResult();
  }

  const activityResult = await ForgeApi.createActivity(createActivityInput);
  const forgeResult = await ForgeApi.forgeActivity(
    activityResult.data.id,
    buildForgeActivityInput(
      forgeMode === "MANUAL"
        ? {
            ...input,
            groupSizeMode: "FIXED",
          }
        : input,
    ),
  );
  const group = await ForgeApi.getGroup(forgeResult.data.group.id);

  return {
    forgeResult: "SUCCESS",
    participants: mapGroupToParticipants(group, currentUser.id),
    activityId: forgeResult.data.activityId,
    groupId: group.id,
    chatId: forgeResult.data.chat.id,
    planId: forgeResult.data.plan.id,
    requestIds: {
      createActivity: activityResult.requestId,
      forgeActivity: forgeResult.requestId,
    },
  };
}

export class ForgeCommands {
  static async executeManualForge(input: AutoForgeExecutionInput) {
    return executeForge(input, "MANUAL");
  }

  static async executeAutoForge(input: AutoForgeExecutionInput) {
    return executeForge(input, "AUTO");
  }

  static async saveForgedIdentity(input: SaveForgedIdentityInput) {
    const requests: Promise<unknown>[] = [];

    if (input.groupId) {
      requests.push(
        ForgeApi.updateGroup(input.groupId, {
          name: input.groupName.trim() || undefined,
          description: input.groupDescription.trim() || null,
          avatar: input.avatarImage,
        }),
      );
    }

    if (input.planId) {
      requests.push(
        ForgeApi.updatePlan(input.planId, {
          coverImage: input.coverImage,
        }),
      );
    }

    await Promise.all(requests);
  }

  static async sendManualInvites(input: SendManualInvitesInput) {
    if (!input.groupId || input.inviteeIds.length === 0) {
      return;
    }

    const message = input.planName.trim()
      ? `I'd like you to join ${input.planName.trim()}.`
      : undefined;

    await Promise.all(
      [...new Set(input.inviteeIds)].map((inviteeId) =>
        ForgeApi.createInvite({
          groupId: input.groupId,
          inviteeId,
          type: "FRIEND_INVITE",
          message,
        }),
      ),
    );
  }
}
