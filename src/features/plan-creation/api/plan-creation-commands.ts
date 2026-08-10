import { PlanCreationApi } from "@/features/plan-creation/api/plan-creation.api";
import {
  invalidateCurrentAutomaticGroupFormationRequest,
  invalidateGroupFormationSearchState,
  invalidateRecentPlanCreationActivities,
} from "@/features/plan-creation/api/plan-creation-cache";
import {
  buildFailedGroupFormationResult,
  buildSuccessfulGroupFormationResult,
} from "@/features/plan-creation/api/plan-creation-result-mappers";
import type {
  AutomaticGroupFormationExecutionInput,
  GroupFormationExecutionResult,
  SaveGroupIdentityInput,
  SendManualInvitesInput,
} from "@/features/plan-creation/api/plan-creation-types";
import { buildAutomaticGroupFormationRequestInput } from "@/features/plan-creation/lib/automatic-group-formation-request-builder";
import {
  buildCreateActivityInput,
  buildGroupFormationActivityInput,
} from "@/features/plan-creation/lib/group-formation-activity-builders";
import type { UpdateAutomaticGroupFormationRequestInput } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";

export class MissingPlanCreationInterestSignalsError extends Error {
  constructor() {
    super("Add at least one interest before starting group formation.");
    this.name = "MissingPlanCreationInterestSignalsError";
  }
}

export class AutomaticGroupFormationRequestSubmissionError extends Error {
  readonly activityId: string;
  override readonly cause: unknown;

  constructor(activityId: string, cause: unknown) {
    super("The activity was saved, but the group request was not confirmed.");
    this.name = "AutomaticGroupFormationRequestSubmissionError";
    this.activityId = activityId;
    this.cause = cause;
  }
}

async function getCurrentUser() {
  return appQueryClient.ensureQueryData(currentUserQueryOptions());
}

function buildManualGroupFormationInput(
  input: AutomaticGroupFormationExecutionInput,
) {
  return buildGroupFormationActivityInput(
    {
      ...input,
      groupSizeMode: "FIXED",
    },
    {
      includeMatchingPreferences: false,
    },
  );
}

async function executeManualGroupFormation(
  input: AutomaticGroupFormationExecutionInput,
  idempotencyKey: string,
  existingActivityId: string | null,
): Promise<GroupFormationExecutionResult> {
  const currentUser = await getCurrentUser();
  const createActivityInput = buildCreateActivityInput(
    currentUser,
    input,
    "MANUAL",
  );

  if (createActivityInput.interestIds.length === 0) {
    throw new MissingPlanCreationInterestSignalsError();
  }

  const activityResult = existingActivityId
    ? null
    : await PlanCreationApi.createActivity(createActivityInput);
  if (activityResult) void invalidateRecentPlanCreationActivities();

  const activityId = existingActivityId ?? activityResult?.data.id;
  if (!activityId) {
    throw new Error("Plan creation did not return an activity.");
  }
  const planCreationInput = buildManualGroupFormationInput(input);

  let groupFormationResult: Awaited<
    ReturnType<typeof PlanCreationApi.groupFormationActivity>
  >;

  try {
    groupFormationResult = await PlanCreationApi.groupFormationActivity(
      activityId,
      planCreationInput,
      idempotencyKey,
    );
  } catch {
    return buildFailedGroupFormationResult({
      activityId,
      requestIds: {
        automaticGroupFormationRequest: null,
        createActivity: activityResult?.requestId ?? null,
        groupFormationActivity: null,
      },
    });
  }

  return buildPlanCreationSuccessResult({
    createActivityRequestId: activityResult?.requestId ?? null,
    currentUserId: currentUser.id,
    groupFormationResult,
  });
}

async function buildPlanCreationSuccessResult({
  createActivityRequestId,
  currentUserId,
  groupFormationResult,
}: {
  createActivityRequestId: string | null;
  currentUserId: string;
  groupFormationResult: Awaited<
    ReturnType<typeof PlanCreationApi.groupFormationActivity>
  >;
}) {
  const group = await PlanCreationApi.getGroup(
    groupFormationResult.data.group.id,
  );

  return buildSuccessfulGroupFormationResult({
    activityId: groupFormationResult.data.activityId,
    chatId: groupFormationResult.data.chat.id,
    currentUserId,
    group,
    planId: groupFormationResult.data.plan.id,
    requestIds: {
      automaticGroupFormationRequest: null,
      createActivity: createActivityRequestId,
      groupFormationActivity: groupFormationResult.requestId,
    },
  });
}

export class PlanCreationCommands {
  static executeManualGroupFormation(
    input: AutomaticGroupFormationExecutionInput,
    idempotencyKey: string,
    existingActivityId: string | null,
  ) {
    return executeManualGroupFormation(
      input,
      idempotencyKey,
      existingActivityId,
    );
  }

  static createAutomaticGroupFormationRequest(
    activityId: string,
    input: AutomaticGroupFormationExecutionInput,
    idempotencyKey: string,
  ) {
    return PlanCreationApi.createAutomaticGroupFormationRequest(
      activityId,
      buildAutomaticGroupFormationRequestInput(input),
      idempotencyKey,
    );
  }

  static updateAutomaticGroupFormationRequest(
    requestId: string,
    input: UpdateAutomaticGroupFormationRequestInput,
    idempotencyKey: string,
  ) {
    return PlanCreationApi.updateAutomaticGroupFormationRequest(
      requestId,
      input,
      idempotencyKey,
    );
  }

  static async runAutomaticGroupFormationRequestAction(
    requestId: string,
    action: "pause" | "resume" | "cancel" | "retry",
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const result =
      await PlanCreationApi.runAutomaticGroupFormationRequestCommand(
        requestId,
        action,
        payload,
        idempotencyKey,
      );

    if (action === "cancel") {
      await invalidateCurrentAutomaticGroupFormationRequest();
    }

    return result;
  }

  static async executeAutomaticGroupFormation(
    input: AutomaticGroupFormationExecutionInput,
    idempotencyKeys: { request: string; resume: string },
    existingActivityId?: string | null,
    existingRequest?: {
      id: string;
      revision: number;
      lifecycle: "DRAFT" | "SEARCHING" | "PAUSED";
    } | null,
  ): Promise<GroupFormationExecutionResult> {
    if (existingRequest) {
      const resumeExpectedRevision = existingRequest.revision + 1;
      const updated =
        await PlanCreationCommands.updateAutomaticGroupFormationRequest(
          existingRequest.id,
          {
            ...buildAutomaticGroupFormationRequestInput(input),
            expectedRevision: existingRequest.revision,
          },
          idempotencyKeys.request,
        );
      const activeRequest =
        existingRequest.lifecycle === "DRAFT" ||
        existingRequest.lifecycle === "PAUSED"
          ? await PlanCreationCommands.runAutomaticGroupFormationRequestAction(
              existingRequest.id,
              "resume",
              {
                expectedRevision: resumeExpectedRevision,
                policyVersion: updated.data.policyVersion,
              },
              idempotencyKeys.resume,
            )
          : updated;

      await invalidateGroupFormationSearchState();

      return {
        groupFormationResult: "SEARCHING",
        participants: [],
        activityId: existingActivityId ?? activeRequest.data.activity.id,
        automaticGroupFormationRequest: {
          id: activeRequest.data.id,
          lifecycle: activeRequest.data.lifecycle,
          revision: activeRequest.data.revision,
        },
        groupId: null,
        chatId: null,
        planId: null,
        requestIds: {
          automaticGroupFormationRequest: activeRequest.requestId,
          createActivity: null,
          groupFormationActivity: null,
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
      throw new MissingPlanCreationInterestSignalsError();
    }

    const activityResult = existingActivityId
      ? null
      : await PlanCreationApi.createActivity(createActivityInput);
    const activityId = existingActivityId ?? activityResult?.data.id;

    if (!activityId) {
      throw new Error("The activity could not be created.");
    }

    void invalidateRecentPlanCreationActivities();

    const requestResult =
      await PlanCreationCommands.createAutomaticGroupFormationRequest(
        activityId,
        input,
        idempotencyKeys.request,
      ).catch((error) => {
        throw new AutomaticGroupFormationRequestSubmissionError(
          activityId,
          error,
        );
      });

    await invalidateGroupFormationSearchState();

    return {
      groupFormationResult: "SEARCHING",
      participants: [],
      activityId,
      automaticGroupFormationRequest: {
        id: requestResult.data.id,
        lifecycle: requestResult.data.lifecycle,
        revision: requestResult.data.revision,
      },
      groupId: null,
      chatId: null,
      planId: null,
      requestIds: {
        automaticGroupFormationRequest: requestResult.requestId,
        createActivity: activityResult?.requestId ?? null,
        groupFormationActivity: null,
      },
    };
  }

  static async saveGroupIdentity(input: SaveGroupIdentityInput) {
    const requests: Promise<unknown>[] = [];

    if (input.groupId) {
      requests.push(
        PlanCreationApi.updateGroup(input.groupId, {
          name: input.groupName.trim() || undefined,
          description: input.groupDescription.trim() || null,
          avatar: input.avatarImage,
        }),
      );
    }

    if (input.planId) {
      requests.push(
        PlanCreationApi.updatePlan(input.planId, {
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
      ? `Join me for ${input.planName.trim()}.`
      : undefined;

    await Promise.all(
      [...new Set(input.inviteeIds)].map((inviteeId) =>
        PlanCreationApi.createInvite({
          groupId: input.groupId,
          inviteeId,
          type: "FRIEND_INVITE",
          message,
        }),
      ),
    );
  }
}
