import type {
  PlanBuilderData,
  PlanBuilderField,
} from "@/features/plan-creation/lib/plan-builder";
import type {
  GroupFormationMode,
  GroupFormationScope,
  GroupSizeMode,
  LocationType,
  PlanScheduleMode,
  Visibility,
} from "@/features/plan-creation/lib/plan-creation-contract";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

import type {
  PlanBuilderDispatch,
  SetPlanBuilderField,
} from "../plan-builder-hook.types";

export interface UsePlanBuilderFieldActionsOptions {
  dispatch: PlanBuilderDispatch;
  state: PlanBuilderData;
  syncMode: (
    mode: GroupFormationMode,
    options?: { history?: "push" | "replace" },
  ) => void;
}

export interface BaseFieldActionOptions {
  setField: SetPlanBuilderField;
}

export interface ActivityFieldActionOptions {
  dispatch: PlanBuilderDispatch;
  syncMode: UsePlanBuilderFieldActionsOptions["syncMode"];
}

export interface PlanCreationSettingsFieldActionOptions
  extends BaseFieldActionOptions {
  state: PlanBuilderData;
  syncMode: UsePlanBuilderFieldActionsOptions["syncMode"];
}

export interface ActivityFieldActions {
  applyActivityTemplate: (templateId: string, template: PlanTemplate) => void;
  clearActivityTemplate: () => void;
  setSelectedActivity: (value: string | null) => void;
}

export interface PlanFieldActions {
  setGroupFormationScope: (value: GroupFormationScope) => void;
  setLocationType: (value: LocationType) => void;
  setPlanCost: (value: "FREE" | "PAID") => void;
  setPlanCostAmount: (value: string) => void;
  setPlanCostDetails: (value: string) => void;
  setPlanDate: (value: string) => void;
  setPlanDescription: (value: string) => void;
  setPlanLocation: (value: string) => void;
  setPlanLocationCoordinates: (lat: number | null, lng: number | null) => void;
  setPlanScheduleMode: (value: PlanScheduleMode) => void;
  setPlanName: (value: string) => void;
  setPlanTime: (value: string) => void;
}

export interface IdentityFieldActions {
  setAvatarImage: (value: string | null) => void;
  setCoverImage: (value: string | null) => void;
  setGroupDescription: (value: string) => void;
  setGroupName: (value: string) => void;
  setInvitesSent: (value: boolean) => void;
}

export interface PlanCreationSettingsFieldActions {
  setAutoMaxSize: (value: number) => void;
  setAutoMinSize: (value: number) => void;
  setAutoSizeRange: (minSize: number, maxSize: number) => void;
  setCompatibilityWeight: (value: number) => void;
  setDiversityWeight: (value: number) => void;
  setNetworkReachWeight: (value: number) => void;
  setMaxDistanceKm: (value: number) => void;
  setFixedSize: (value: number) => void;
  setGroupFormationMode: (value: GroupFormationMode) => void;
  setGroupSizeMode: (value: GroupSizeMode) => void;
  setVisibility: (value: Visibility) => void;
  toggleManualInvitee: (inviteeId: string) => void;
}

export interface PlanBuilderFieldActions
  extends ActivityFieldActions,
    PlanFieldActions,
    IdentityFieldActions,
    PlanCreationSettingsFieldActions {
  setField: <Field extends PlanBuilderField>(
    field: Field,
    value: PlanBuilderData[Field],
  ) => void;
}
