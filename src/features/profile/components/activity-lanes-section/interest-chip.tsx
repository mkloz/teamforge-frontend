import type { ActivityLaneEvidence } from "@/features/profile/lib/profile-insights";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { getEvidenceTitle } from "./activity-lane-formatters";

interface InterestChipProps {
  evidence: ActivityLaneEvidence;
}

export function InterestChip({ evidence }: InterestChipProps) {
  const { interest } = evidence;
  const isSupporting = evidence.role === "supporting";
  const evidenceTitle = getEvidenceTitle(evidence);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-7 max-w-full cursor-help items-center rounded-full border px-2.5 text-left font-bold text-xs leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 sm:min-h-8 sm:px-3",
            isSupporting
              ? "border-border/80 bg-canvas text-ink/70"
              : "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
          )}
        >
          {interest.name}
        </button>
      </TooltipTrigger>
      <TooltipContent>{evidenceTitle}</TooltipContent>
    </Tooltip>
  );
}
