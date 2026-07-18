import type {
  ForgeParticipant,
  ForgeResult,
} from "@/features/forge/lib/forge-contract";

export type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";

export interface ForgeExecutionResult {
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
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
