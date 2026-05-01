import type { LocationMode } from "@/shared/schemas";

import type {
  FixedGroupSize,
  ForgeParticipant,
  ForgeResult,
  GroupSizeMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";

export interface ForgeExecutionResult {
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  requestIds: {
    createActivity: string | null;
    forgeActivity: string | null;
  };
}

export interface AutoForgeExecutionInput {
  selectedActivity: string | null;
  planName: string;
  planDescription: string;
  planDate: string;
  planTime: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  coverImage: string | null;
  locationType: LocationMode;
  planCost: "FREE" | "PAID";
  planCostAmount: string;
  planCostDetails: string;
  groupSizeMode: GroupSizeMode;
  fixedSize: FixedGroupSize;
  autoMinSize: number;
  autoMaxSize: number;
  visibility: Visibility;
  groupName: string;
  groupDescription: string;
  avatarImage: string | null;
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
