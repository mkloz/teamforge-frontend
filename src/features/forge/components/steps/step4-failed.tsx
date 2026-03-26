import { AlertCircle } from "lucide-react";
import type { ForgeMode } from "../../types/forge.types";

export interface Step4FailedProps {
  forgeMode: ForgeMode;
}

export function Step4Failed({ forgeMode }: Step4FailedProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Simulation Report Banner */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-linear-to-br from-destructive/10 via-destructive/2 to-transparent border border-destructive/20 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-destructive flex items-center justify-center shrink-0 shadow-lg shadow-destructive/20">
          <AlertCircle size={24} className="text-white" strokeWidth={3} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold tracking-widest text-destructive/80 transition-colors">
            No matches
          </p>
          <h3 className="text-base font-black text-foreground leading-tight tracking-tight">
            We couldn't find a match
          </h3>
          <p className="text-[9px] text-muted-foreground font-medium italic opacity-80">
            Try adjusting your settings below
          </p>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          What happened?
        </p>
        <div className="grid gap-3">
          {[
            forgeMode === "auto"
              ? "The diversity settings were a bit too strict for the current pool of members."
              : "There weren't enough available members for the group size you requested.",
            "Privacy settings might be limiting who can see this group.",
            "This activity or time slot has fewer people active right now.",
          ].map((reason, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border/50 bg-background/50 group hover:border-destructive/20 transition-all"
            >
              <div className="w-1 h-5 rounded-full bg-destructive/10 group-hover:bg-destructive/30 transition-colors shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Adjustments */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          Suggested changes
        </p>
        <div className="rounded-xl border border-accent/20 bg-linear-to-br from-accent/5 to-transparent p-5 space-y-3">
          {(forgeMode === "auto"
            ? [
                "Lower the matching level",
                "Expand the group size range",
                "Set privacy to 'Public'",
              ]
            : [
                "Try a smaller group size",
                "Open to your network",
                "Try a different time or date",
              ]
          ).map((rec, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-accent/40" />
              <p className="text-[10px] font-bold text-accent tracking-widest opacity-80">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Instruction */}
      <p className="text-[10px] text-muted-foreground text-center font-medium italic opacity-60">
        Tap <span className="text-foreground font-bold">Try again</span> to
        change your settings.
      </p>
    </div>
  );
}
