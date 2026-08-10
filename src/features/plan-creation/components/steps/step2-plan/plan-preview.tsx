import {
  PlanSummaryFact,
  PlanSummaryPoster,
  PlanSummaryTitleBlock,
} from "@/features/plan-creation/components/plan-creation-snapshot-elements";
import { cn } from "@/shared/lib/utils";

import {
  getGroupSummary,
  getPlaceSummary,
  getTimeSummary,
  isPlaceComplete,
  isTimeComplete,
} from "./plan-summary";
import type {
  GroupFormationScope,
  LocationType,
  PlanScheduleMode,
} from "./types";

type PreviewSectionId = "basics" | "group" | "place" | "time";

interface PlanPreviewProps {
  activeSection: PreviewSectionId | null;
  className?: string;
  coverImage: string | null;
  groupFormationMode: "AUTO" | "MANUAL";
  groupFormationScope: GroupFormationScope;
  locationType: LocationType;
  planDate: string;
  planDescription: string;
  planLocation: string;
  planName: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
  selectedActivity: string | null;
  variant?: "drawer" | "rail";
}

export function PlanPreview({
  activeSection,
  className,
  coverImage,
  groupFormationMode,
  groupFormationScope,
  locationType,
  planDate,
  planDescription,
  planLocation,
  planName,
  planScheduleMode,
  planTime,
  selectedActivity,
  variant = "rail",
}: PlanPreviewProps) {
  const title = planName.trim() || "Your plan";
  const description =
    planDescription.trim() || "Add context so people know what to expect.";
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
  const readySections = [
    planName.trim().length >= 3,
    true,
    isPlaceComplete(locationType, planLocation),
    isTimeComplete({
      planDate,
      planScheduleMode,
      planTime,
    }),
  ];
  const readyCount = readySections.filter(Boolean).length;

  return (
    <aside
      aria-label="Live plan preview"
      className={cn(
        variant === "rail" &&
          "border-border/35 border-t pt-6 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 xl:pl-8",
        className,
      )}
    >
      <PreviewHeader
        activeSection={activeSection}
        readyCount={readyCount}
        readySections={readySections}
      />

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
          {description}
        </p>
      </div>

      <dl className="mt-5 border-border/35 border-y py-2">
        <PlanSummaryFact
          active={activeSection === "group"}
          label="Who"
          value={getGroupSummary(groupFormationMode)}
        />
        <PlanSummaryFact
          active={activeSection === "place"}
          label="Place"
          value={placeSummary}
        />
        <PlanSummaryFact
          active={activeSection === "time"}
          label="Time"
          value={timeSummary}
        />
      </dl>
    </aside>
  );
}

function PreviewHeader({
  activeSection,
  readyCount,
  readySections,
}: {
  activeSection: PreviewSectionId | null;
  readyCount: number;
  readySections: boolean[];
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="font-bold text-foreground text-sm">Live plan</p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {activeSection
            ? `Editing ${PREVIEW_SECTION_LABELS[activeSection]}`
            : "Preview ready"}
        </p>
      </div>

      <div className="w-20 shrink-0">
        <span className="sr-only">{readyCount} of 4 choices ready</span>
        <div aria-hidden="true" className="flex gap-1">
          {PREVIEW_SECTION_ORDER.map((section, index) => (
            <span
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                readySections[index] ? "bg-brand-teal" : "bg-border",
              )}
              key={section}
            />
          ))}
        </div>
        <p
          aria-hidden="true"
          className="mt-1 text-right text-muted-foreground text-xs"
        >
          {readyCount} of 4 ready
        </p>
      </div>
    </div>
  );
}

const PREVIEW_SECTION_LABELS = {
  basics: "the idea",
  group: "the group",
  place: "the place",
  time: "the schedule",
} satisfies Record<PreviewSectionId, string>;

const PREVIEW_SECTION_ORDER: PreviewSectionId[] = [
  "basics",
  "group",
  "place",
  "time",
];
