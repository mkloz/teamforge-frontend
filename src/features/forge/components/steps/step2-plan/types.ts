export type LocationType = "IN_PERSON" | "ONLINE" | "TBD";
export type ForgeScope = "LOCAL" | "ONLINE";
export type PlanScheduleMode = "TO_BE_DECIDED" | "FIXED";

export interface Step2PlanProps {
  coverImage: string | null;
  forgeMode: "AUTO" | "MANUAL";
  onForgeModeChange: (value: "AUTO" | "MANUAL") => void;
  forgeScope: ForgeScope;
  onForgeScopeChange: (value: ForgeScope) => void;
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
