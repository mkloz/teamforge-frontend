import type {
  ForgeParticipant,
  ForgeResult,
} from "@/features/forge/lib/forge-contract";
import type { AutoForgeRequest } from "@/features/forge/schemas/auto-forge-request.schema";

export type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";

export interface ForgeExecutionResult {
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  autoForgeRequest: Pick<
    AutoForgeRequest,
    "id" | "lifecycle" | "revision"
  > | null;
  requestIds: {
    autoForgeRequest: string | null;
    createActivity: string | null;
    forgeActivity: string | null;
  };
}

export interface SaveForgedIdentityInput {
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
