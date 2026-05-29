import type { ActivityLane } from "@/features/profile/lib/profile-insights";

import { describeLaneEvidence } from "./activity-lane-formatters";
import { activityLaneIcons } from "./activity-lane-icons";
import { InterestChip } from "./interest-chip";

interface ActivityLaneRowProps {
  lane: ActivityLane;
}

export function ActivityLaneRow({ lane }: ActivityLaneRowProps) {
  const Icon = activityLaneIcons[lane.key];
  const evidenceLabel = describeLaneEvidence(lane);

  return (
    <div className="flex min-w-0 flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:py-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-forge-teal/10 text-forge-teal">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-extrabold text-ink text-sm">{lane.label}</h3>
          <p className="mt-1 font-semibold text-slate-muted text-xs">
            {evidenceLabel}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
          {lane.evidence.map((evidence) => (
            <InterestChip key={evidence.interest.id} evidence={evidence} />
          ))}
        </div>
      </div>
    </div>
  );
}
