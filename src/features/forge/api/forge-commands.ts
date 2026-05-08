import { ForgeApi } from "@/features/forge/api/forge.api";
import {
  invalidateForgeSearchState,
  invalidateRecentForgeActivities,
} from "@/features/forge/api/forge-cache";
import {
  buildFailedForgeResult,
  buildSuccessfulForgeResult,
} from "@/features/forge/api/forge-result-mappers";
import type {
  AutoForgeExecutionInput,
  ForgeExecutionResult,
  KeepSearchingInput,
  SaveForgedIdentityInput,
  SendManualInvitesInput,
} from "@/features/forge/api/forge-types";
import {
  buildCreateActivityInput,
  buildForgeActivityInput,
} from "@/features/forge/lib/forge-activity-builders";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";

async function getCurrentUser() {
  return appQueryClient.ensureQueryData(currentUserQueryOptions());
}

function buildModeForgeInput(
  input: AutoForgeExecutionInput,
  forgeMode: "AUTO" | "MANUAL",
) {
  return buildForgeActivityInput(
    forgeMode === "MANUAL"
      ? {
          ...input,
          groupSizeMode: "FIXED",
        }
      : input,
  );
}

async function keepAutoSearchOpen(
  activityId: string,
  forgeInput: ReturnType<typeof buildForgeActivityInput>,
) {
  try {
    await ForgeApi.keepSearching(activityId, forgeInput);
    return true;
  } catch {
    return false;
  }
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

  void invalidateRecentForgeActivities();

  const activityId = activityResult.data.id;
  const forgeInput = buildModeForgeInput(input, forgeMode);

  let forgeResult: Awaited<ReturnType<typeof ForgeApi.forgeActivity>>;

  try {
    forgeResult = await ForgeApi.forgeActivity(activityId, forgeInput);
  } catch {
    if (forgeMode === "AUTO") {
      const searchKept = await keepAutoSearchOpen(activityId, forgeInput);

      return buildFailedForgeResult({
        activityId,
        searchKept,
        requestIds: {
          createActivity: activityResult.requestId,
          forgeActivity: null,
        },
      });
    }

    return buildFailedForgeResult({
      activityId,
      requestIds: {
        createActivity: activityResult.requestId,
        forgeActivity: null,
      },
    });
  }

  const group = await ForgeApi.getGroup(forgeResult.data.group.id);

  return buildSuccessfulForgeResult({
    activityId: forgeResult.data.activityId,
    chatId: forgeResult.data.chat.id,
    currentUserId: currentUser.id,
    group,
    planId: forgeResult.data.plan.id,
    requestIds: {
      createActivity: activityResult.requestId,
      forgeActivity: forgeResult.requestId,
    },
  });
}

export class ForgeCommands {
  static async executeManualForge(input: AutoForgeExecutionInput) {
    return executeForge(input, "MANUAL");
  }

  static async executeAutoForge(input: AutoForgeExecutionInput) {
    return executeForge(input, "AUTO");
  }

  static async executePendingAutoForge(
    activityId: string,
  ): Promise<ForgeExecutionResult> {
    const currentUser = await getCurrentUser();
    const forgeResult = await ForgeApi.forgePendingActivity(activityId);
    const group = await ForgeApi.getGroup(forgeResult.data.group.id);

    return buildSuccessfulForgeResult({
      activityId: forgeResult.data.activityId,
      chatId: forgeResult.data.chat.id,
      currentUserId: currentUser.id,
      group,
      planId: forgeResult.data.plan.id,
      requestIds: {
        createActivity: null,
        forgeActivity: forgeResult.requestId,
      },
    });
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

  static async keepSearching(input: KeepSearchingInput) {
    await ForgeApi.keepSearching(
      input.activityId,
      buildForgeActivityInput(input.forgeInput),
    );

    await invalidateForgeSearchState();
  }

  static async stopSearching(activityId: string) {
    await ForgeApi.stopSearching(activityId);

    await invalidateForgeSearchState();
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
