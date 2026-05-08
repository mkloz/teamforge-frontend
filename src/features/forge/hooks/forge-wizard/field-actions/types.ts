import type {
  ForgeMode,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type {
  ForgeWizardData,
  ForgeWizardField,
} from "@/features/forge/lib/forge-wizard";

import type {
  ForgeWizardDispatch,
  SetForgeWizardField,
} from "../forge-wizard-hook.types";

export interface UseForgeWizardFieldActionsOptions {
  dispatch: ForgeWizardDispatch;
  state: ForgeWizardData;
  syncMode: (
    mode: ForgeMode,
    options?: { history?: "push" | "replace" },
  ) => void;
}

export interface BaseFieldActionOptions {
  setField: SetForgeWizardField;
}

export interface ActivityFieldActionOptions {
  dispatch: ForgeWizardDispatch;
  syncMode: UseForgeWizardFieldActionsOptions["syncMode"];
}

export interface ForgeSettingsFieldActionOptions
  extends BaseFieldActionOptions {
  state: ForgeWizardData;
  syncMode: UseForgeWizardFieldActionsOptions["syncMode"];
}

export interface ActivityFieldActions {
  applyActivityTemplate: (
    templateId: string,
    template: ForgePlanTemplate,
  ) => void;
  clearActivityTemplate: () => void;
  setSelectedActivity: (value: string | null) => void;
}

export interface PlanFieldActions {
  setLocationType: (value: LocationType) => void;
  setPlanCost: (value: "FREE" | "PAID") => void;
  setPlanCostAmount: (value: string) => void;
  setPlanCostDetails: (value: string) => void;
  setPlanDate: (value: string) => void;
  setPlanDescription: (value: string) => void;
  setPlanLocation: (value: string) => void;
  setPlanLocationCoordinates: (lat: number | null, lng: number | null) => void;
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

export interface ForgeSettingsFieldActions {
  setAutoMaxSize: (value: number) => void;
  setAutoMinSize: (value: number) => void;
  setCompatibilityWeight: (value: number) => void;
  setDiversityWeight: (value: number) => void;
  setFixedSize: (value: number) => void;
  setForgeMode: (value: ForgeMode) => void;
  setGroupSizeMode: (value: GroupSizeMode) => void;
  setVisibility: (value: Visibility) => void;
  toggleManualInvitee: (inviteeId: string) => void;
}

export interface ForgeWizardFieldActions
  extends ActivityFieldActions,
    PlanFieldActions,
    IdentityFieldActions,
    ForgeSettingsFieldActions {
  setField: <Field extends ForgeWizardField>(
    field: Field,
    value: ForgeWizardData[Field],
  ) => void;
}
