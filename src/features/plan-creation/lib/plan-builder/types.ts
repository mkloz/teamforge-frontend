import type {
  FixedGroupSize,
  FormationCandidate,
  GroupFormationMode,
  GroupFormationResult,
  GroupFormationScope,
  GroupSizeMode,
  LocationType,
  PlanScheduleMode,
  Visibility,
} from "@/features/plan-creation/lib/plan-creation-contract";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
import type { AutomaticGroupFormationRequest } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import type { PlanCategory } from "@/shared/schemas";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type NavDirection = "forward" | "back";

export interface PlanBuilderData {
  step: Step;
  navDirection: NavDirection;
  selectedActivity: string | null;
  planCategory: PlanCategory | null;
  appliedTemplateId: string | null;
  planName: string;
  planDescription: string;
  planScheduleMode: PlanScheduleMode;
  planDate: string;
  planTime: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  groupFormationScope: GroupFormationScope;
  locationType: LocationType;
  planCost: "FREE" | "PAID";
  planCostAmount: string;
  planCostDetails: string;
  groupFormationMode: GroupFormationMode;
  fixedSize: FixedGroupSize;
  groupSizeMode: GroupSizeMode;
  autoMinSize: number;
  autoMaxSize: number;
  compatibilityWeight: number;
  diversityWeight: number;
  networkReachWeight: number;
  maxDistanceKm: number;
  visibility: Visibility;
  groupFormationResult: GroupFormationResult;
  participants: FormationCandidate[];
  removedIds: Set<string>;
  groupName: string;
  groupDescription: string;
  manualInviteeIds: string[];
  coverImage: string | null;
  templateCoverImage: string | null;
  avatarImage: string | null;
  activityId: string | null;
  automaticGroupFormationRequestId: string | null;
  automaticGroupFormationRequestRevision: number | null;
  automaticGroupFormationRequestLifecycle:
    | AutomaticGroupFormationRequest["lifecycle"]
    | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  inviteCopied: boolean;
  invitesSent: boolean;
}

export type PlanBuilderField =
  | "selectedActivity"
  | "planCategory"
  | "appliedTemplateId"
  | "planName"
  | "planDescription"
  | "planScheduleMode"
  | "planDate"
  | "planTime"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
  | "groupFormationScope"
  | "locationType"
  | "planCost"
  | "planCostAmount"
  | "planCostDetails"
  | "groupFormationMode"
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
  | "automaticGroupFormationRequestId"
  | "automaticGroupFormationRequestRevision"
  | "automaticGroupFormationRequestLifecycle"
  | "groupId"
  | "chatId"
  | "planId"
  | "inviteCopied"
  | "invitesSent";

export interface PlanBuilderSetFieldAction<
  Field extends PlanBuilderField = PlanBuilderField,
> {
  type: "set-field";
  field: Field;
  value: PlanBuilderData[Field];
}

export type PlanBuilderAction =
  | { type: "reset" }
  | { type: "select-activity"; activity: string | null }
  | {
      type: "apply-activity-template";
      template: PlanTemplate;
      templateId: string;
    }
  | { type: "clear-activity-template" }
  | { type: "set-step"; step: Step; navDirection: NavDirection }
  | { type: "go-next" }
  | { type: "go-back" }
  | PlanBuilderSetFieldAction
  | {
      type: "apply-plan-creation-result";
      result: GroupFormationResult;
      participants: FormationCandidate[];
      activityId: string | null;
      automaticGroupFormationRequest?: Pick<
        AutomaticGroupFormationRequest,
        "id" | "lifecycle" | "revision"
      > | null;
      groupId: string | null;
      chatId: string | null;
      planId: string | null;
      step?: Step;
    }
  | { type: "remove-participant"; userId: string }
  | { type: "restore-participant"; userId: string }
  | { type: "revisePlan" };
