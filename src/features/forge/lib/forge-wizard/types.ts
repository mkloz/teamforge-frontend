import type {
  FixedGroupSize,
  ForgeMode,
  ForgeParticipant,
  ForgeResult,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "@/features/forge/lib/forge-contract";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export type NavDirection = "forward" | "back";

export interface ForgeWizardData {
  step: Step;
  navDirection: NavDirection;
  selectedActivity: string | null;
  planName: string;
  planDescription: string;
  planDate: string;
  planTime: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  locationType: LocationType;
  planCost: "FREE" | "PAID";
  planCostAmount: string;
  planCostDetails: string;
  forgeMode: ForgeMode;
  fixedSize: FixedGroupSize;
  groupSizeMode: GroupSizeMode;
  autoMinSize: number;
  autoMaxSize: number;
  compatibilityWeight: number;
  diversityWeight: number;
  visibility: Visibility;
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  groupName: string;
  groupDescription: string;
  manualInviteeIds: string[];
  coverImage: string | null;
  avatarImage: string | null;
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  inviteCopied: boolean;
  invitesSent: boolean;
}

export type ForgeWizardField =
  | "selectedActivity"
  | "planName"
  | "planDescription"
  | "planDate"
  | "planTime"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
  | "locationType"
  | "planCost"
  | "planCostAmount"
  | "planCostDetails"
  | "forgeMode"
  | "fixedSize"
  | "groupSizeMode"
  | "autoMinSize"
  | "autoMaxSize"
  | "compatibilityWeight"
  | "diversityWeight"
  | "visibility"
  | "groupName"
  | "groupDescription"
  | "manualInviteeIds"
  | "coverImage"
  | "avatarImage"
  | "activityId"
  | "groupId"
  | "chatId"
  | "planId"
  | "inviteCopied"
  | "invitesSent";

export type ForgeWizardAction =
  | { type: "reset" }
  | { type: "set-step"; step: Step; navDirection: NavDirection }
  | { type: "go-next" }
  | { type: "go-back" }
  | {
      type: "set-field";
      field: ForgeWizardField;
      value: ForgeWizardData[ForgeWizardField];
    }
  | {
      type: "apply-forge-result";
      result: ForgeResult;
      participants: ForgeParticipant[];
      activityId: string | null;
      groupId: string | null;
      chatId: string | null;
      planId: string | null;
    }
  | { type: "remove-participant"; userId: string }
  | { type: "restore-participant"; userId: string }
  | { type: "reforge" };
