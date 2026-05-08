import { useState } from "react";
import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
import type { ActivityLane } from "@/features/profile/lib/profile-insights";

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
            <button
              type="button"
              className="inline-flex min-h-11 items-center text-left font-bold text-forge-teal text-xs uppercase tracking-widest transition-colors hover:text-forge-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30"
              onClick={() => setIsExpanded((value) => !value)}
            >
              {isExpanded
                ? "Show fewer lanes"
                : `Show ${hiddenLaneCount} more lane${hiddenLaneCount === 1 ? "" : "s"}`}
            </button>
          ) : null}
        </>
      ) : (
        <EmptyActivityLanes />
      )}
    </section>
  );
}
