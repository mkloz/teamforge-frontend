export type LocationType = "IN_PERSON" | "ONLINE" | "TBD";

export interface Step2PlanProps {
  planName: string;
  onPlanNameChange: (v: string) => void;
  planDescription: string;
  onPlanDescriptionChange: (v: string) => void;
  planDate: string;
  onPlanDateChange: (v: string) => void;
  planTime: string;
  onPlanTimeChange: (v: string) => void;
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
}
