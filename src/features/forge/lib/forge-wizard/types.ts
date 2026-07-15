import type {
  FixedGroupSize,
  ForgeMode,
  ForgeParticipant,
  ForgeResult,
  GroupSizeMode,
  LocationType,
  PlanScheduleMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type NavDirection = "forward" | "back";

export interface ForgeWizardData {
  step: Step;
  navDirection: NavDirection;
  selectedActivity: string | null;
  appliedTemplateId: string | null;
  planName: string;
  planDescription: string;
  planScheduleMode: PlanScheduleMode;
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
  networkReachWeight: number;
  maxDistanceKm: number;
  visibility: Visibility;
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  groupName: string;
  groupDescription: string;
  manualInviteeIds: string[];
  coverImage: string | null;
  templateCoverImage: string | null;
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
  | "appliedTemplateId"
  | "planName"
  | "planDescription"
  | "planScheduleMode"
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
  | "networkReachWeight"
  | "maxDistanceKm"
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

export interface ForgeWizardSetFieldAction<
  Field extends ForgeWizardField = ForgeWizardField,
> {
  type: "set-field";
  field: Field;
  value: ForgeWizardData[Field];
}

export type ForgeWizardAction =
  | { type: "reset" }
  | { type: "select-activity"; activity: string | null }
  | {
      type: "apply-activity-template";
      template: ForgePlanTemplate;
      templateId: string;
    }
  | { type: "clear-activity-template" }
  | { type: "set-step"; step: Step; navDirection: NavDirection }
  | { type: "go-next" }
  | { type: "go-back" }
  | ForgeWizardSetFieldAction
  | {
      type: "apply-forge-result";
      result: ForgeResult;
      participants: ForgeParticipant[];
      activityId: string | null;
      groupId: string | null;
      chatId: string | null;
      planId: string | null;
      step?: Step;
    }
  | { type: "remove-participant"; userId: string }
  | { type: "restore-participant"; userId: string }
  | { type: "reforge" };
