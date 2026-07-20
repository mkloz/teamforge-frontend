import { DateTimeSection } from "./date-time-section";
import { EventTitleSection } from "./event-title-section";
import { FormationMethodSection } from "./formation-method-section";
import { LocationSection } from "./location-section";
import { PlanDetailsSection } from "./plan-details-section";
import { ScopeSection } from "./scope-section";
import type { Step2PlanProps } from "./types";

export function Step2Plan({
  forgeMode,
  onForgeModeChange,
  forgeScope,
  onForgeScopeChange,
  planName,
  onPlanNameChange,
  planDescription,
  onPlanDescriptionChange,
  planDate,
  onPlanDateChange,
  planTime,
  onPlanTimeChange,
  planScheduleMode,
  onPlanScheduleModeChange,
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
    <div className="flex flex-col gap-4 pb-6">
      <FormationMethodSection value={forgeMode} onChange={onForgeModeChange} />

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

      {forgeMode === "AUTO" ? (
        <ScopeSection value={forgeScope} onChange={onForgeScopeChange} />
      ) : null}

      <DateTimeSection
        scheduleMode={forgeMode === "AUTO" ? planScheduleMode : "FIXED"}
        onScheduleModeChange={onPlanScheduleModeChange}
        canDecideTogether={forgeMode === "AUTO"}
        onPlanDateChange={onPlanDateChange}
        onPlanTimeChange={onPlanTimeChange}
        planDate={planDate}
        planTime={planTime}
      />

      <LocationSection
        forgeScope={forgeMode === "AUTO" ? forgeScope : null}
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
