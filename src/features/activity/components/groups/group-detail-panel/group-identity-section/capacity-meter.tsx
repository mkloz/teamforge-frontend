import { cn } from "@/shared/lib/utils";
import type { CapacityDisplayState } from "./types";

export function GroupCapacityMeter({
  capacityState,
  maxMembers,
  memberCount,
}: {
  capacityState: CapacityDisplayState;
  maxMembers: number;
  memberCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <meter className="sr-only" max={maxMembers} min={0} value={memberCount}>
        {memberCount} of {maxMembers} seats filled
      </meter>
      <span className="shrink-0 text-slate-muted text-xs">Capacity</span>
      <div className="flex min-w-0 flex-1 gap-1">
        {capacityState.capacitySegments.map((segment) => (
          <CapacitySegment
            key={segment}
            filledCapacitySegments={capacityState.filledCapacitySegments}
            segment={segment}
          />
        ))}
      </div>
    </div>
  );
}

function CapacitySegment({
  filledCapacitySegments,
  segment,
}: {
  filledCapacitySegments: number;
  segment: string;
}) {
  const segmentNumber = Number(segment);

  return (
    <span
      className={cn(
        "h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300",
        segmentNumber <= filledCapacitySegments
          ? "bg-forge-teal"
          : "bg-slate-muted/20",
      )}
    />
  );
}
