import {
  PlanSummaryFact,
  PlanSummaryPoster,
  PlanSummaryTitleBlock,
} from "@/features/plan-creation/components/plan-creation-snapshot-elements";

import { getPlaceSummary, getTimeSummary } from "../step2-plan/plan-summary";
import type { Step3GroupProps } from "./types";

type GroupRequestSummaryProps = Pick<
  Step3GroupProps,
  | "autoMaxSize"
  | "autoMinSize"
  | "coverImage"
  | "fixedSize"
  | "groupFormationMode"
  | "groupFormationScope"
  | "groupDescription"
  | "groupName"
  | "locationType"
  | "manualInviteeIds"
  | "planDate"
  | "planDescription"
  | "planLocation"
  | "planName"
  | "planScheduleMode"
  | "planTime"
  | "selectedActivity"
  | "visibility"
>;

export function GroupRequestSummary({
  autoMaxSize,
  autoMinSize,
  coverImage,
  fixedSize,
  groupFormationMode,
  groupFormationScope,
  groupDescription,
  groupName,
  locationType,
  manualInviteeIds,
  planDate,
  planDescription,
  planLocation,
  planName,
  planScheduleMode,
  planTime,
  selectedActivity,
  visibility,
}: GroupRequestSummaryProps) {
  const title =
    groupFormationMode === "MANUAL"
      ? groupName?.trim() || planName.trim() || "Your group"
      : planName.trim() || "Your request";
  const description =
    groupFormationMode === "MANUAL"
      ? groupDescription?.trim() || planDescription.trim()
      : planDescription.trim();

  return (
    <aside
      aria-label="Group request summary"
      className="hidden self-start border-border/35 border-l pl-6 lg:sticky lg:top-28 lg:block xl:pl-8"
    >
      <p className="font-bold text-foreground text-sm">Group snapshot</p>
      <p className="mt-0.5 text-muted-foreground text-xs">
        Updates as you make choices.
      </p>

      <div className="mt-5">
        {coverImage ? (
          <PlanSummaryPoster
            coverImage={coverImage}
            eyebrow={selectedActivity}
            title={title}
          />
        ) : (
          <PlanSummaryTitleBlock eyebrow={selectedActivity} title={title} />
        )}

        <p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {description || "Add context so people know what to expect."}
        </p>
      </div>

      <dl className="mt-5 border-border/35 border-y py-2">
        <PlanSummaryFact
          label="Who"
          value={
            groupFormationMode === "AUTO"
              ? "Findafew finds people"
              : "You choose the group"
          }
        />
        <PlanSummaryFact
          label="Place"
          value={getPlaceSummary({
            groupFormationScope,
            locationType,
            planLocation,
          })}
        />
        <PlanSummaryFact
          label="Time"
          value={getTimeSummary({
            planDate,
            planScheduleMode,
            planTime,
          })}
        />
        <PlanSummaryFact
          label={groupFormationMode === "AUTO" ? "Target" : "Seats"}
          value={
            groupFormationMode === "AUTO"
              ? `${autoMinSize}–${autoMaxSize} people`
              : `${manualInviteeIds.length + 1} of ${fixedSize} planned`
          }
        />
        {groupFormationMode === "MANUAL" ? (
          <PlanSummaryFact
            label="Visibility"
            value={getVisibilityLabel(visibility)}
          />
        ) : null}
      </dl>
    </aside>
  );
}

function getVisibilityLabel(visibility: Step3GroupProps["visibility"]) {
  if (visibility === "FRIENDS_ONLY") {
    return "Friends only";
  }

  if (visibility === "INVITE_ONLY") {
    return "Invite only";
  }

  return "Public";
}
