import type { ForgeMode } from "@/features/forge/lib/forge-contract";
import { cn } from "@/shared/lib/utils";
import type { Step } from "../hooks/use-forge-wizard";

interface ForgeProgressBarProps {
  step: Step;
  isPreForge: boolean;
  forgeResult: string;
  forgeMode: ForgeMode;
  className?: string;
}

export function ForgeProgressBar({
  forgeMode,
  step,
  isPreForge,
  className,
}: ForgeProgressBarProps) {
  const preSteps = [
    { s: 1, label: "Activity" },
    { s: 2, label: "Template" },
    { s: 3, label: "Plan" },
    { s: 4, label: "Group" },
  ];
  const postSteps = [
    { s: 5, label: "Result" },
    { s: 6, label: "Identity" },
    { s: 7, label: "Invite" },
  ];
  const manualPostSteps = [
    { s: 6, label: "Identity" },
    { s: 7, label: "Invite" },
  ];

  const steps = isPreForge
    ? preSteps
    : forgeMode === "MANUAL"
      ? manualPostSteps
      : postSteps;
  const activeColor = isPreForge ? "bg-accent" : "bg-primary";
  const activeTextColor = isPreForge ? "text-accent" : "text-primary";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1.5">
        {steps.map(({ s, label }) => {
          const isActive = s === step;
          const isComplete = s < step;

          return (
            <div key={s} className={cn("flex flex-1 flex-col gap-1.5")}>
              {/* Track bar */}
              <div className="relative h-0.75 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-colors duration-500 ease-out",
                    s <= step ? activeColor : "bg-transparent",
                  )}
                />
              </div>

              {/* Step label + number */}
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-micro font-bold tabular-nums transition-colors duration-500",
                    isActive
                      ? activeTextColor
                      : isComplete
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground/40",
                  )}
                >
                  {s}.
                </span>
                <p
                  className={cn(
                    "text-micro font-semibold transition-colors duration-500",
                    isActive
                      ? activeTextColor
                      : isComplete
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground/40",
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
