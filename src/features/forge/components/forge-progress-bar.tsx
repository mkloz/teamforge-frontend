import { cn } from "@/shared/lib/utils";
import type { Step } from "../hooks/use-forge-wizard";

interface ForgeProgressBarProps {
  step: Step;
  isPreForge: boolean;
  forgeResult: string;
  className?: string;
}

export function ForgeProgressBar({
  step,
  isPreForge,
  className,
}: ForgeProgressBarProps) {
  const preSteps = [
    { s: 1, label: "Activity" },
    { s: 2, label: "Plan" },
    { s: 3, label: "Group" },
  ];
  const postSteps = [
    { s: 4, label: "Result" },
    { s: 5, label: "Identity" },
    { s: 6, label: "Invite" },
  ];

  const steps = isPreForge ? preSteps : postSteps;
  // Brand color mapping: pre-forge uses amber (accent), post uses teal (primary)
  const trackActive = isPreForge ? "bg-accent" : "bg-primary";
  const dotActive = isPreForge ? "bg-accent border-accent" : "bg-primary border-primary";
  const dotDone = isPreForge ? "bg-accent/30 border-accent/40" : "bg-primary/30 border-primary/40";
  const textActive = isPreForge ? "text-accent" : "text-primary";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-0">
        {steps.map(({ s, label }, idx) => {
          const isActive = s === step;
          const isComplete = s < step;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s} className="flex items-center flex-1">
              {/* Step node + label stacked */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                {/* Track segment leading into this node (not for first) */}
                {idx === 0 && (
                  <div className="flex flex-col items-center gap-1.5">
                    {/* Dot */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full border-2 transition-all duration-500",
                        isActive
                          ? dotActive + " scale-125 shadow-sm"
                          : isComplete
                            ? dotDone
                            : "bg-transparent border-border/40",
                      )}
                    />
                    {/* Label */}
                    <p
                      className={cn(
                        "text-[11px] font-semibold transition-colors duration-500 whitespace-nowrap",
                        isActive
                          ? textActive
                          : isComplete
                            ? "text-muted-foreground/60"
                            : "text-muted-foreground/40",
                      )}
                    >
                      {label}
                    </p>
                  </div>
                )}
              </div>

              {/* Track bar between nodes (render for all but last) */}
              {!isLast && (
                <div className="flex-1 flex flex-col items-stretch gap-1.5 mx-1">
                  {/* Bar */}
                  <div className="relative h-[3px] rounded-full overflow-hidden bg-border/30">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                        isComplete ? trackActive : "w-0",
                      )}
                      style={{ width: isComplete ? "100%" : "0%" }}
                    />
                  </div>
                  {/* Spacer matching label height */}
                  <div className="h-[15px]" />
                </div>
              )}

              {/* Dot + label for steps after first */}
              {idx > 0 && (
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full border-2 transition-all duration-500",
                      isActive
                        ? dotActive + " scale-125 shadow-sm"
                        : isComplete
                          ? dotDone
                          : "bg-transparent border-border/40",
                    )}
                  />
                  <p
                    className={cn(
                      "text-[11px] font-semibold transition-colors duration-500 whitespace-nowrap",
                      isActive
                        ? textActive
                        : isComplete
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground/40",
                    )}
                  >
                    {label}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
