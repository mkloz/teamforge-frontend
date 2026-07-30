import {
  ForgeSnapshotFact,
  ForgeSnapshotPoster,
  ForgeSnapshotTitleBlock,
} from "@/features/forge/components/forge-snapshot-elements";

import { getPlaceSummary, getTimeSummary } from "../step2-plan/plan-summary";
import type { Step3GroupProps } from "./types";

type GroupRequestSummaryProps = Pick<
  Step3GroupProps,
  | "autoMaxSize"
  | "autoMinSize"
  | "coverImage"
  | "fixedSize"
  | "forgeMode"
  | "forgeScope"
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
  forgeMode,
  forgeScope,
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
    forgeMode === "MANUAL"
      ? groupName?.trim() || planName.trim() || "Your group"
      : planName.trim() || "Your request";
  const description =
    forgeMode === "MANUAL"
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
          <ForgeSnapshotPoster
            coverImage={coverImage}
            eyebrow={selectedActivity}
            title={title}
          />
        ) : (
          <ForgeSnapshotTitleBlock eyebrow={selectedActivity} title={title} />
        )}

        <p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {description || "Add context so people know what to expect."}
        </p>
      </div>

      <dl className="mt-5 border-border/35 border-y py-2">
        <ForgeSnapshotFact
          label="Who"
          value={
            forgeMode === "AUTO"
              ? "TeamForge finds people"
              : "You choose the group"
          }
        />
        <ForgeSnapshotFact
          label="Place"
          value={getPlaceSummary({
            forgeScope,
            locationType,
            planLocation,
          })}
        />
        <ForgeSnapshotFact
          label="Time"
          value={getTimeSummary({
            planDate,
            planScheduleMode,
            planTime,
          })}
        />
        <ForgeSnapshotFact
          label={forgeMode === "AUTO" ? "Target" : "Seats"}
          value={
            forgeMode === "AUTO"
              ? `${autoMinSize}–${autoMaxSize} people`
              : `${manualInviteeIds.length + 1} of ${fixedSize} planned`
          }
        />
        {forgeMode === "MANUAL" ? (
          <ForgeSnapshotFact
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
