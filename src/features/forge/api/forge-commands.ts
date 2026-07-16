import { ForgeApi } from "@/features/forge/api/forge.api";
import {
  invalidateCurrentAutoForgeRequest,
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
import { buildAutoForgeRequestInput } from "@/features/forge/lib/auto-forge-request-builder";
import {
  buildCreateActivityInput,
  buildForgeActivityInput,
} from "@/features/forge/lib/forge-activity-builders";
import type { UpdateAutoForgeRequestInput } from "@/features/forge/schemas/auto-forge-request.schema";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";

export class MissingForgeInterestSignalsError extends Error {
  constructor() {
    super("Add at least one interest before forging a group.");
    this.name = "MissingForgeInterestSignalsError";
  }
}

export class AutoForgeRequestSubmissionError extends Error {
  readonly activityId: string;
  override readonly cause: unknown;

  constructor(activityId: string, cause: unknown) {
    super("The activity was saved, but the Forge request was not confirmed.");
    this.name = "AutoForgeRequestSubmissionError";
    this.activityId = activityId;
    this.cause = cause;
  }
}

async function getCurrentUser() {
  return appQueryClient.ensureQueryData(currentUserQueryOptions());
}

function buildManualForgeInput(input: AutoForgeExecutionInput) {
  return buildForgeActivityInput(
    {
      ...input,
      groupSizeMode: "FIXED",
    },
    {
      includeMatchingPreferences: false,
    },
  );
}

async function executeManualForge(
  input: AutoForgeExecutionInput,
): Promise<ForgeExecutionResult> {
  const currentUser = await getCurrentUser();
  const createActivityInput = buildCreateActivityInput(
    currentUser,
    input,
    "MANUAL",
  );

  if (createActivityInput.interestIds.length === 0) {
    throw new MissingForgeInterestSignalsError();
  }

  const activityResult = await ForgeApi.createActivity(createActivityInput);

  void invalidateRecentForgeActivities();

  const activityId = activityResult.data.id;
  const forgeInput = buildManualForgeInput(input);

  let forgeResult: Awaited<ReturnType<typeof ForgeApi.forgeActivity>>;

  try {
    forgeResult = await ForgeApi.forgeActivity(activityId, forgeInput);
  } catch {
    return buildFailedForgeResult({
      activityId,
      requestIds: {
        autoForgeRequest: null,
        createActivity: activityResult.requestId,
        forgeActivity: null,
      },
    });
  }

  return buildForgeSuccessResult({
    createActivityRequestId: activityResult.requestId,
    currentUserId: currentUser.id,
    forgeResult,
  });
}

async function buildForgeSuccessResult({
  createActivityRequestId,
  currentUserId,
  forgeResult,
}: {
  createActivityRequestId: string | null;
  currentUserId: string;
  forgeResult: Awaited<ReturnType<typeof ForgeApi.forgeActivity>>;
}) {
  const group = await ForgeApi.getGroup(forgeResult.data.group.id);

  return buildSuccessfulForgeResult({
    activityId: forgeResult.data.activityId,
    chatId: forgeResult.data.chat.id,
    currentUserId,
    group,
    planId: forgeResult.data.plan.id,
    requestIds: {
      autoForgeRequest: null,
      createActivity: createActivityRequestId,
      forgeActivity: forgeResult.requestId,
    },
  });
}

export class ForgeCommands {
  static createAutoForgeRequest(
    activityId: string,
    input: AutoForgeExecutionInput,
    idempotencyKey: string,
  ) {
    return ForgeApi.createAutoForgeRequest(
      activityId,
      buildAutoForgeRequestInput(input),
      idempotencyKey,
    );
  }

  static updateAutoForgeRequest(
    requestId: string,
    input: UpdateAutoForgeRequestInput,
    idempotencyKey: string,
  ) {
    return ForgeApi.updateAutoForgeRequest(requestId, input, idempotencyKey);
  }

  static async runAutoForgeRequestAction(
    requestId: string,
    action: "pause" | "resume" | "cancel" | "retry",
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const result = await ForgeApi.runAutoForgeRequestCommand(
      requestId,
      action,
      payload,
      idempotencyKey,
    );

    if (action === "cancel") {
      await invalidateCurrentAutoForgeRequest();
    }

    return result;
  }

  static async executeManualForge(input: AutoForgeExecutionInput) {
    return executeManualForge(input);
  }

  static async executeAutoForge(
    input: AutoForgeExecutionInput,
    idempotencyKeys: { request: string; resume: string },
    existingActivityId?: string | null,
    existingRequest?: {
      id: string;
      revision: number;
      lifecycle: "DRAFT" | "SEARCHING" | "PAUSED";
    } | null,
  ): Promise<ForgeExecutionResult> {
    if (existingRequest) {
      const resumeExpectedRevision = existingRequest.revision + 1;
      const updated = await ForgeCommands.updateAutoForgeRequest(
        existingRequest.id,
        {
          ...buildAutoForgeRequestInput(input),
          expectedRevision: existingRequest.revision,
        },
        idempotencyKeys.request,
      );
      const activeRequest =
        existingRequest.lifecycle === "DRAFT" ||
        existingRequest.lifecycle === "PAUSED"
          ? await ForgeCommands.runAutoForgeRequestAction(
              existingRequest.id,
              "resume",
              {
                expectedRevision: resumeExpectedRevision,
                policyVersion: updated.data.policyVersion,
              },
              idempotencyKeys.resume,
            )
          : updated;

      await invalidateForgeSearchState();

      return {
        forgeResult: "SEARCHING",
        participants: [],
        activityId: existingActivityId ?? activeRequest.data.activity.id,
        groupId: null,
        chatId: null,
        planId: null,
        requestIds: {
          autoForgeRequest: activeRequest.requestId,
          createActivity: null,
          forgeActivity: null,
        },
      };
    }

    const currentUser = await getCurrentUser();
    const createActivityInput = buildCreateActivityInput(
      currentUser,
      input,
      "AUTO",
    );

    if (createActivityInput.interestIds.length === 0) {
      throw new MissingForgeInterestSignalsError();
    }

    const activityResult = existingActivityId
      ? null
      : await ForgeApi.createActivity(createActivityInput);
    const activityId = existingActivityId ?? activityResult?.data.id;

    if (!activityId) {
      throw new Error("The activity could not be created.");
    }

    void invalidateRecentForgeActivities();

    const requestResult = await ForgeCommands.createAutoForgeRequest(
      activityId,
      input,
      idempotencyKeys.request,
    ).catch((error) => {
      throw new AutoForgeRequestSubmissionError(activityId, error);
    });

    await invalidateForgeSearchState();

    return {
      forgeResult: "SEARCHING",
      participants: [],
      activityId,
      groupId: null,
      chatId: null,
      planId: null,
      requestIds: {
        autoForgeRequest: requestResult.requestId,
        createActivity: activityResult?.requestId ?? null,
        forgeActivity: null,
      },
    };
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
      ? `Join me for ${input.planName.trim()}.`
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
