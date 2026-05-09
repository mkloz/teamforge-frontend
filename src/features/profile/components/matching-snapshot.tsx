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
    <span
      className={cn(
        "inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border px-3 font-bold text-xs",
        signal.strength === "ready"
          ? "border-forge-teal/25 bg-forge-teal/10 text-forge-teal"
          : signal.strength === "good"
            ? "border-spark-amber/25 bg-spark-amber/8 text-spark-amber"
            : "border-border/80 text-slate-muted",
      )}
      title={signal.detail}
    >
      <span className="text-ink/80">{signal.label}</span>
      <span>{signal.value}</span>
    </span>
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
