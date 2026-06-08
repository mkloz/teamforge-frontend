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

export function ActivityLanesSection({ lanes }: ActivityLanesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleLanes = isExpanded ? lanes : lanes.slice(0, defaultVisibleCount);
  const hiddenLaneCount = Math.max(lanes.length - visibleLanes.length, 0);

  return (
    <section className="flex flex-col gap-5">
      <ProfileSectionHeading>Activity lanes</ProfileSectionHeading>

      {visibleLanes.length > 0 ? (
        <>
          <div className="divide-y divide-border/70">
            {visibleLanes.map((lane) => (
              <ActivityLaneRow key={lane.key} lane={lane} />
            ))}
          </div>
          {lanes.length > defaultVisibleCount ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto min-h-0 self-start px-0 py-1.5 text-forge-teal active:enabled:translate-y-0 active:enabled:scale-100 active:enabled:bg-transparent! hover:enabled:bg-transparent! hover:enabled:text-forge-teal/80"
              onClick={() => setIsExpanded((value) => !value)}
            >
              {isExpanded ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
              {isExpanded
                ? "Show fewer lanes"
                : `Show ${hiddenLaneCount} more lane${hiddenLaneCount === 1 ? "" : "s"}`}
            </Button>
          ) : null}
        </>
      ) : (
        <EmptyActivityLanes />
      )}
    </section>
  );
}
