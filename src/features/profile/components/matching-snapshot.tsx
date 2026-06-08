import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import type { MatchingSignal } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface MatchingSnapshotProps {
  signals: MatchingSignal[];
}

export function MatchingSnapshot({ signals }: MatchingSnapshotProps) {
  const visibleSignals = getVisibleSignals(signals);

  return (
    <section className="flex flex-col gap-4">
      <ProfileSectionHeading>Match basis</ProfileSectionHeading>

      <div className="flex flex-wrap gap-2">
        {visibleSignals.map((signal) => (
          <SignalPill key={signal.label} signal={signal} />
        ))}
      </div>
    </section>
  );
}

function SignalPill({ signal }: { signal: MatchingSignal }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-9 max-w-full cursor-help items-center gap-2 rounded-full border px-3 text-left font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35",
            signal.strength === "ready"
              ? "border-forge-teal/25 bg-forge-teal/10 text-forge-teal"
              : signal.strength === "good"
                ? "border-spark-amber/25 bg-spark-amber/8 text-spark-amber"
                : "border-border/80 text-slate-muted",
          )}
        >
          <span className="text-ink/80">{signal.label}</span>
          <span
            className={
              signal.strength === "ready"
                ? "text-forge-teal dark:text-slate-muted"
                : undefined
            }
          >
            {signal.value}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{signal.detail}</TooltipContent>
    </Tooltip>
  );
}

function getVisibleSignals(signals: MatchingSignal[]) {
  const preferredLabels = new Set([
    "Activity read",
    "Social read",
    "Match confidence",
  ]);
  const preferred = signals.filter((signal) =>
    preferredLabels.has(signal.label),
  );

  return preferred.length > 0 ? preferred : signals.slice(0, 3);
}
