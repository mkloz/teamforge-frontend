import { AlertCircle, ArrowRight } from "lucide-react";
import type { ForgeMode } from "../../lib/forge-contract";

export interface Step4FailedProps {
  forgeMode: ForgeMode;
}

export function Step4Failed({ forgeMode }: Step4FailedProps) {
  const reasons =
    forgeMode === "AUTO"
      ? [
          "The diversity or matching settings were too strict for the current member pool.",
          "Privacy settings may be limiting who can see this group.",
          "This activity or time slot has fewer people active right now.",
        ]
      : [
          "Your profile may still be missing enough interests for this activity.",
          "The plan details may need a clearer activity signal for manual coordination.",
          "The group could not be created with the current inputs.",
        ];

  const suggestions =
    forgeMode === "AUTO"
      ? [
          "Lower the matching threshold",
          "Expand the group size range",
          "Set privacy to Public",
        ]
      : [
          "Add a few more matching interests to your profile",
          "Adjust the activity or plan details and try again",
          "Switch to Algorithmic mode if you want TeamForge to fill the group automatically",
        ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Warm Warning Hero */}
      <div className="rounded-2xl bg-spark-amber/5 border border-spark-amber/20 p-5 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-spark-amber flex items-center justify-center shrink-0 shadow-lg shadow-spark-amber/20">
          <AlertCircle size={22} className="text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-spark-amber uppercase tracking-wider">
            Pool constraint
          </p>
          <h3 className="text-lg font-bold text-ink leading-tight mt-1">
            We couldn&apos;t form a group
          </h3>
          <p className="text-sm text-slate-muted mt-1.5 leading-relaxed">
            {forgeMode === "AUTO"
              ? "Our algorithm analyzed the current pool but couldn&apos;t find a perfectly compatible match for your settings."
              : "We tried to create your manual group, but the request could not be completed with the current inputs."}
          </p>
        </div>
      </div>

      {/* Analysis Context */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-muted uppercase tracking-widest px-1">
          Likely causes
        </p>
        <div className="grid gap-3">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-spark-amber/40 shrink-0 mt-2" />
              <p className="text-[13px] text-slate-muted font-medium leading-relaxed">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested adjustments */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-muted uppercase tracking-widest px-1">
          Suggested adjustments
        </p>
        <div className="rounded-2xl border border-forge-teal/10 bg-forge-teal/5 divide-y divide-forge-teal/10 overflow-hidden shadow-sm">
          {suggestions.map((rec, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-4 hover:bg-forge-teal/10 transition-colors duration-200"
            >
              <ArrowRight size={14} className="text-forge-teal shrink-0" />
              <p className="text-sm font-semibold text-forge-teal/90">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer cue */}
      <div className="py-4 border-t border-border/40">
        <p className="text-xs text-slate-muted text-center leading-relaxed italic opacity-80">
          Tap <span className="font-bold text-ink">Try again</span> below to go
          back and adjust your settings.
        </p>
      </div>
    </div>
  );
}
