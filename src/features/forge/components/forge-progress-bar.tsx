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
  const activeColor = isPreForge ? "bg-accent" : "bg-primary";
  const activeTextColor = isPreForge ? "text-accent" : "text-primary";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1.5">
        {steps.map(({ s, label }) => {
          const isActive = s === step;
          const isComplete = s < step;
          return (
            <div key={s} className="flex-1 space-y-1.5">
              {/* Track bar */}
              <div className="relative h-0.5 rounded-full overflow-hidden bg-muted">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500 ease-out",
                    s <= step ? activeColor : "bg-transparent",
                  )}
                />
                {/* Shimmer for completed steps */}
                {isComplete && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full opacity-40",
                      activeColor,
                      "animate-pulse",
                    )}
                  />
                )}
              </div>

              {/* Step label + number */}
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-[10px] font-black tabular-nums transition-colors duration-500",
                    isActive
                      ? activeTextColor
                      : isComplete
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground/20",
                  )}
                >
                  {s}.
                </span>
                <p
                  className={cn(
                    "text-[11px] font-bold tracking-wider transition-colors duration-500",
                    isActive
                      ? activeTextColor
                      : isComplete
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground/20",
                  )}
                >
                  {label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
