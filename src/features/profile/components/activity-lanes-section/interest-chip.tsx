import type { ActivityLaneEvidence } from "@/features/profile/lib/profile-insights";
import { cn } from "@/shared/lib/utils";

import { getEvidenceTitle } from "./activity-lane-formatters";

interface InterestChipProps {
  evidence: ActivityLaneEvidence;
}

export function InterestChip({ evidence }: InterestChipProps) {
  const { interest } = evidence;
  const isSupporting = evidence.role === "supporting";

  return (
    <span
      title={getEvidenceTitle(evidence)}
      className={cn(
        "inline-flex min-h-8 max-w-full items-center rounded-full border px-3 font-bold text-xs leading-snug",
        isSupporting
          ? "border-border/80 bg-canvas text-ink/70"
          : "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
      )}
    >
      {interest.name}
    </span>
  );
}
