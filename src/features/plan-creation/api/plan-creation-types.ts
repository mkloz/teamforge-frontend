import type {
  FormationCandidate,
  GroupFormationResult,
} from "@/features/plan-creation/lib/plan-creation-contract";
import type { AutomaticGroupFormationRequest } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";

export type { AutomaticGroupFormationExecutionInput } from "@/features/plan-creation/lib/group-formation-execution-schema";

export interface GroupFormationExecutionResult {
  groupFormationResult: GroupFormationResult;
  participants: FormationCandidate[];
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  automaticGroupFormationRequest: Pick<
    AutomaticGroupFormationRequest,
    "id" | "lifecycle" | "revision"
  > | null;
  requestIds: {
    automaticGroupFormationRequest: string | null;
    createActivity: string | null;
    groupFormationActivity: string | null;
  };
}

export interface SaveGroupIdentityInput {
  groupId: string | null;
  planId: string | null;
  groupName: string;
  groupDescription: string;
  avatarImage: string | null;
  coverImage: string | null;
}

export interface SendManualInvitesInput {
  groupId: string | null;
  inviteeIds: string[];
  planName: string;
}
