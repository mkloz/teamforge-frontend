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

interface ForgeProgressStep {
  s: Step;
  label: string;
}

const PRE_FORGE_PROGRESS_STEPS: ForgeProgressStep[] = [
  { s: 1, label: "Activity" },
  { s: 2, label: "Template" },
  { s: 3, label: "Plan" },
  { s: 4, label: "Group" },
];

const AUTO_FORGE_PROGRESS_STEPS: ForgeProgressStep[] = [
  { s: 1, label: "Activity" },
  { s: 2, label: "Template" },
  { s: 3, label: "Plan" },
  { s: 4, label: "Review" },
  { s: 5, label: "Search state" },
];

const MANUAL_POST_FORGE_PROGRESS_STEPS: ForgeProgressStep[] = [
  { s: 6, label: "Details" },
  { s: 7, label: "Invite" },
];

function getProgressSteps(
  isPreForge: boolean,
  forgeMode: ForgeMode,
): ForgeProgressStep[] {
  if (forgeMode === "AUTO") {
    return AUTO_FORGE_PROGRESS_STEPS;
  }

  if (isPreForge) {
    return PRE_FORGE_PROGRESS_STEPS;
  }

  return MANUAL_POST_FORGE_PROGRESS_STEPS;
}

function getProgressValue(steps: ForgeProgressStep[], step: Step) {
  const activeStepIndex = steps.findIndex(({ s }) => s === step);

  if (activeStepIndex >= 0) {
    return activeStepIndex + 1;
  }

  const firstStep = steps.at(0);
  return firstStep && step < firstStep.s ? 0 : steps.length;
}

function getProgressText(progressValue: number, stepsCount: number) {
  return progressValue > 0
    ? `Step ${progressValue} of ${stepsCount}`
    : "Forge progress not started";
}

export function ForgeProgressBar({
  forgeMode,
  step,
  isPreForge,
  className,
}: ForgeProgressBarProps) {
  const steps = getProgressSteps(isPreForge, forgeMode);
  const progressValue = getProgressValue(steps, step);
  const progressText = getProgressText(progressValue, steps.length);
  const activeLabel = steps.find(({ s }) => s === step)?.label;

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <progress
        aria-label="Forge progress"
        className="sr-only"
        max={steps.length}
        value={progressValue}
      >
        {progressText}
      </progress>
      <p aria-hidden="true" className="min-w-0 truncate text-xs">
        <span className="font-semibold text-muted-foreground">
          {progressValue} of {steps.length}
        </span>
        {activeLabel ? (
          <span className="text-muted-foreground/70"> · {activeLabel}</span>
        ) : null}
      </p>
      <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
        {steps.map(({ s }) => {
          const isActive = s === step;
          const isComplete = s < step;

          return (
            <span
              key={s}
              className={cn(
                "size-1.5 rounded-full transition-colors duration-200",
                isActive && "bg-forge-teal ring-2 ring-forge-teal/20",
                isComplete && "bg-forge-teal/60",
                !isActive && !isComplete && "bg-muted-foreground/25",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
