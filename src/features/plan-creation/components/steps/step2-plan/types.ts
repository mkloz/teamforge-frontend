export type LocationType = "IN_PERSON" | "ONLINE" | "TBD";
export type GroupFormationScope = "LOCAL" | "ONLINE";
export type PlanScheduleMode = "TO_BE_DECIDED" | "FIXED";

export interface Step2PlanProps {
  coverImage: string | null;
  groupFormationMode: "AUTO" | "MANUAL";
  onGroupFormationModeChange: (value: "AUTO" | "MANUAL") => void;
  groupFormationScope: GroupFormationScope;
  hasLocalFormationCoordinates: boolean;
  isCheckingLocalFormationCoordinates: boolean;
  onGroupFormationScopeChange: (value: GroupFormationScope) => void;
  planName: string;
  onPlanNameChange: (v: string) => void;
  planDescription: string;
  onPlanDescriptionChange: (v: string) => void;
  planDate: string;
  onPlanDateChange: (v: string) => void;
  planTime: string;
  onPlanTimeChange: (v: string) => void;
  planScheduleMode: PlanScheduleMode;
  onPlanScheduleModeChange: (value: PlanScheduleMode) => void;
  planLocation: string;
  onPlanLocationChange: (v: string) => void;
  planLocationLat: number | null;
  planLocationLng: number | null;
  onPlanLocationCoordinatesChange: (
    lat: number | null,
    lng: number | null,
  ) => void;
  locationType: LocationType;
  onLocationTypeChange: (v: LocationType) => void;
  selectedActivity: string | null;
}
