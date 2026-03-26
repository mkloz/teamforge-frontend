import { AlertCircle, ArrowRight } from "lucide-react";
import type { ForgeMode } from "../../types/forge.types";

export interface Step4FailedProps {
  forgeMode: ForgeMode;
}

export function Step4Failed({ forgeMode }: Step4FailedProps) {
  const reasons =
    forgeMode === "auto"
      ? [
          "The diversity or matching settings were too strict for the current member pool.",
          "Privacy settings may be limiting who can see this group.",
          "This activity or time slot has fewer people active right now.",
        ]
      : [
          "There weren't enough available members for the group size you requested.",
          "Privacy settings may be limiting who can see this group.",
          "This activity or time slot has fewer people active right now.",
        ];

  const suggestions =
    forgeMode === "auto"
      ? ["Lower the matching threshold", "Expand the group size range", "Set privacy to Public"]
      : ["Try a smaller group size", "Open the group to your network", "Try a different time or date"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

      {/* Error hero */}
      <div className="rounded-2xl bg-destructive/6 border border-destructive/20 p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-destructive flex items-center justify-center shrink-0 shadow-lg shadow-destructive/20">
          <AlertCircle size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-destructive/80">No matches found</p>
          <h3 className="text-base font-bold text-foreground leading-tight mt-0.5">
            We couldn&apos;t find a group
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            The algorithm ran but no compatible members were available. Try adjusting your settings and forging again.
          </p>
        </div>
      </div>

      {/* What happened */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">What might have happened</p>
        <div className="flex flex-col gap-2">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-border/40 bg-card"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-destructive/40 shrink-0 mt-1.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested changes */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Suggested adjustments</p>
        <div className="rounded-2xl border border-accent/20 bg-accent/5 divide-y divide-accent/10 overflow-hidden">
          {suggestions.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <ArrowRight size={14} className="text-accent/60 shrink-0" />
              <p className="text-sm font-medium text-accent">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer cue */}
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Tap <span className="font-semibold text-foreground">Try again</span> below to go back and adjust your settings.
      </p>

    </div>
  );
}
