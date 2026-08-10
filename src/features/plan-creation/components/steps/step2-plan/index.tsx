"use client";

import { useState } from "react";

import { DateTimeSection } from "./date-time-section";
import { EventTitleSection } from "./event-title-section";
import { FormationMethodSection } from "./formation-method-section";
import { LocationSection } from "./location-section";
import { PlanDetailsSection } from "./plan-details-section";
import { PlanPreview } from "./plan-preview";
import { PlanSection } from "./plan-section";
import {
  getGroupSummary,
  getPlaceSummary,
  getTimeSummary,
  isPlaceComplete,
  isTimeComplete,
} from "./plan-summary";
import { ScopeSection } from "./scope-section";
import type { Step2PlanProps } from "./types";

type PlanSectionId = "basics" | "group" | "place" | "time";

export function Step2Plan({
  coverImage,
  groupFormationMode,
  onGroupFormationModeChange,
  groupFormationScope,
  hasLocalFormationCoordinates,
  isCheckingLocalFormationCoordinates,
  onGroupFormationScopeChange,
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
  selectedActivity,
}: Step2PlanProps) {
  const [activeSection, setActiveSection] = useState<PlanSectionId | null>(
    "basics",
  );
  const trimmed = planName.trim();
  const isNameError = planName.length > 0 && trimmed.length < 3;
  const isNameValid = trimmed.length >= 3;
  const charCount = trimmed.length;
  const placeSummary = getPlaceSummary({
    groupFormationScope,
    locationType,
    planLocation,
  });
  const timeSummary = getTimeSummary({
    planDate,
    planScheduleMode,
    planTime,
  });

  function toggleSection(section: PlanSectionId) {
    setActiveSection((current) => (current === section ? null : section));
  }

  return (
    <div className="grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)] lg:items-start xl:gap-7">
      <div className="min-w-0 overflow-hidden border-border/35 border-t">
        <PlanSection
          active={activeSection === "basics"}
          complete={isNameValid}
          index={1}
          onToggle={() => toggleSection("basics")}
          sectionId="plan-basics"
          summary={trimmed || "Name and context"}
          title="Basics"
        >
          <div className="flex flex-col gap-4">
            <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
              Give the idea a clear name and add anything people should know.
            </p>
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
          </div>
        </PlanSection>

        <PlanSection
          active={activeSection === "group"}
          complete
          index={2}
          onToggle={() => toggleSection("group")}
          sectionId="plan-group"
          summary={getGroupSummary(groupFormationMode)}
          title="Group"
        >
          <FormationMethodSection
            value={groupFormationMode}
            onChange={onGroupFormationModeChange}
          />
        </PlanSection>

        <PlanSection
          active={activeSection === "place"}
          complete={isPlaceComplete(locationType, planLocation)}
          index={3}
          onToggle={() => toggleSection("place")}
          sectionId="plan-place"
          summary={placeSummary}
          title="Place"
        >
          <div className="flex flex-col gap-5">
            <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
              Decide how people will join, then add meeting details if you have
              them.
            </p>

            <div className="border-border/30 border-t">
              <ScopeSection
                value={groupFormationScope}
                onChange={onGroupFormationScopeChange}
              />
              <LocationSection
                groupFormationScope={groupFormationScope}
                hasLocalFormationCoordinates={hasLocalFormationCoordinates}
                isCheckingLocalFormationCoordinates={
                  isCheckingLocalFormationCoordinates
                }
                locationType={locationType}
                onLocationTypeChange={onLocationTypeChange}
                onPlanLocationChange={onPlanLocationChange}
                onPlanLocationCoordinatesChange={
                  onPlanLocationCoordinatesChange
                }
                planLocation={planLocation}
                planLocationLat={planLocationLat}
                planLocationLng={planLocationLng}
              />
            </div>
          </div>
        </PlanSection>

        <PlanSection
          active={activeSection === "time"}
          complete={isTimeComplete({
            planDate,
            planScheduleMode,
            planTime,
          })}
          index={4}
          onToggle={() => toggleSection("time")}
          sectionId="plan-time"
          summary={timeSummary}
          title="Time"
        >
          <DateTimeSection
            scheduleMode={
              groupFormationMode === "AUTO" ? planScheduleMode : "FIXED"
            }
            onScheduleModeChange={onPlanScheduleModeChange}
            canDecideTogether={groupFormationMode === "AUTO"}
            onPlanDateChange={onPlanDateChange}
            onPlanTimeChange={onPlanTimeChange}
            planDate={planDate}
            planTime={planTime}
          />
        </PlanSection>
      </div>

      <PlanPreview
        activeSection={activeSection}
        className="hidden md:block"
        coverImage={coverImage}
        groupFormationMode={groupFormationMode}
        groupFormationScope={groupFormationScope}
        locationType={locationType}
        planDate={planDate}
        planDescription={planDescription}
        planLocation={planLocation}
        planName={planName}
        planScheduleMode={
          groupFormationMode === "AUTO" ? planScheduleMode : "FIXED"
        }
        planTime={planTime}
        selectedActivity={selectedActivity}
      />
    </div>
  );
}

export type { Step2PlanProps } from "./types";
