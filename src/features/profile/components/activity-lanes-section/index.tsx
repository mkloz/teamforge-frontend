import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
import type { ActivityLane } from "@/features/profile/lib/profile-insights";
import { Button } from "@/shared/components/ui/button";

import { ActivityLaneRow } from "./activity-lane-row";
import { EmptyActivityLanes } from "./empty-activity-lanes";

const defaultVisibleCount = 2;

interface ActivityLanesSectionProps {
  lanes: ActivityLane[];
}

interface ActivityLanesVisibility {
  hiddenLaneCount: number;
  visibleLanes: ActivityLane[];
}

export function ActivityLanesSection({ lanes }: ActivityLanesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibility = getActivityLanesVisibility(lanes, isExpanded);

  return (
    <section className="flex flex-col gap-5">
      <ProfileSectionHeading>Activity lanes</ProfileSectionHeading>

      <ActivityLanesContent
        isExpanded={isExpanded}
        lanes={lanes}
        visibility={visibility}
        onToggleExpanded={() => setIsExpanded((value) => !value)}
      />
    </section>
  );
}

function ActivityLanesContent({
  isExpanded,
  lanes,
  onToggleExpanded,
  visibility,
}: {
  isExpanded: boolean;
  lanes: ActivityLane[];
  onToggleExpanded: () => void;
  visibility: ActivityLanesVisibility;
}) {
  if (visibility.visibleLanes.length === 0) {
    return <EmptyActivityLanes />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {visibility.visibleLanes.map((lane) => (
          <ActivityLaneRow key={lane.key} lane={lane} />
        ))}
      </div>
      <ActivityLanesToggleButton
        hiddenLaneCount={visibility.hiddenLaneCount}
        isExpanded={isExpanded}
        shouldShow={lanes.length > defaultVisibleCount}
        onToggleExpanded={onToggleExpanded}
      />
    </>
  );
}

function ActivityLanesToggleButton({
  hiddenLaneCount,
  isExpanded,
  onToggleExpanded,
  shouldShow,
}: {
  hiddenLaneCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  shouldShow: boolean;
}) {
  if (!shouldShow) {
    return null;
  }

  const Icon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto min-h-11 self-start px-0 py-1.5 text-forge-teal active:enabled:translate-y-0 active:enabled:scale-100 active:enabled:bg-transparent! hover:enabled:bg-transparent! hover:enabled:text-forge-teal/80 [@media(pointer:fine)]:min-h-0"
      onClick={onToggleExpanded}
    >
      <Icon className="size-4" aria-hidden="true" />
      {getActivityLanesToggleLabel(isExpanded, hiddenLaneCount)}
    </Button>
  );
}

function getActivityLanesVisibility(
  lanes: ActivityLane[],
  isExpanded: boolean,
): ActivityLanesVisibility {
  const visibleLanes = isExpanded ? lanes : lanes.slice(0, defaultVisibleCount);

  return {
    hiddenLaneCount: Math.max(lanes.length - visibleLanes.length, 0),
    visibleLanes,
  };
}

function getActivityLanesToggleLabel(
  isExpanded: boolean,
  hiddenLaneCount: number,
) {
  if (isExpanded) {
    return "Show fewer lanes";
  }

  return `Show ${hiddenLaneCount} more lane${getLaneCountSuffix(hiddenLaneCount)}`;
}

function getLaneCountSuffix(hiddenLaneCount: number) {
  return hiddenLaneCount === 1 ? "" : "s";
}
