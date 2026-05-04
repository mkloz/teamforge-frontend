import { DateTimeSection } from "./date-time-section";
import { EventTitleSection } from "./event-title-section";
import { LocationSection } from "./location-section";
import { PlanDetailsSection } from "./plan-details-section";
import type { Step2PlanProps } from "./types";

export function Step2Plan({
  planName,
  onPlanNameChange,
  planDescription,
  onPlanDescriptionChange,
  planDate,
  onPlanDateChange,
  planTime,
  onPlanTimeChange,
  planLocation,
  onPlanLocationChange,
  planLocationLat,
  planLocationLng,
  onPlanLocationCoordinatesChange,
  locationType,
  onLocationTypeChange,
}: Step2PlanProps) {
  const trimmed = planName.trim();
  const isNameError = planName.length > 0 && trimmed.length < 3;
  const isNameValid = trimmed.length >= 3;
  const charCount = trimmed.length;

  return (
    <div className="space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <EventTitleSection
        charCount={charCount}
        isNameError={isNameError}
        isNameValid={isNameValid}
        onPlanNameChange={onPlanNameChange}
        planName={planName}
      />

      <PlanDetailsSection
        onPlanDescriptionChange={onPlanDescriptionChange}
        planDescription={planDescription}
      />

      <DateTimeSection
        onPlanDateChange={onPlanDateChange}
        onPlanTimeChange={onPlanTimeChange}
        planDate={planDate}
        planTime={planTime}
      />

      <LocationSection
        locationType={locationType}
        onLocationTypeChange={onLocationTypeChange}
        onPlanLocationChange={onPlanLocationChange}
        onPlanLocationCoordinatesChange={onPlanLocationCoordinatesChange}
        planLocation={planLocation}
        planLocationLat={planLocationLat}
        planLocationLng={planLocationLng}
      />
    </div>
  );
}

export type { Step2PlanProps } from "./types";
