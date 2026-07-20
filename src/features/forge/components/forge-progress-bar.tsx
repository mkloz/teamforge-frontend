import { domMax, LazyMotion, m } from "framer-motion";
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

const FORGE_PROGRESS_ACCENT_COLOR = "var(--color-forge-teal)";

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

function getProgressStepState(s: Step, step: Step) {
  return {
    isActive: s === step,
    isComplete: s < step,
  };
}

function getProgressStepClassName(isActive: boolean, isComplete: boolean) {
  return cn(
    "relative flex h-6 flex-1 items-center justify-center overflow-hidden rounded-full transition-all duration-300",
    isComplete
      ? "bg-forge-teal/20"
      : isActive
        ? "bg-forge-teal/12 ring-1 ring-forge-teal/40"
        : "bg-muted/60",
  );
}

function getProgressLabelClassName(isActive: boolean, isComplete: boolean) {
  return cn(
    "relative select-none truncate px-2 font-semibold leading-none transition-colors duration-200",
    isActive
      ? "pl-5 text-forge-teal text-micro"
      : isComplete
        ? "text-forge-teal/60 text-micro"
        : "text-micro text-muted-foreground/40",
  );
}

function getProgressLabel(
  label: string,
  isActive: boolean,
  isComplete: boolean,
) {
  return isActive ? label : isComplete ? "✓" : "";
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

  return (
    <>
      <progress
        aria-label="Forge progress"
        className="sr-only"
        max={steps.length}
        value={progressValue}
      >
        {progressText}
      </progress>
      <LazyMotion features={domMax}>
        <div
          aria-hidden="true"
          className={cn("flex w-full items-center gap-1.5", className)}
        >
          {steps.map(({ s, label }) => {
            const { isActive, isComplete } = getProgressStepState(s, step);

            return (
              <div
                key={s}
                className={getProgressStepClassName(isActive, isComplete)}
              >
                {/* Fill bar for completed */}
                {isComplete && (
                  <m.span
                    className="absolute inset-0 rounded-full bg-forge-teal/20"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    style={{ transformOrigin: "left" }}
                  />
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <m.span
                    layoutId="forge-active-pip"
                    className="absolute left-2 size-1.5 rounded-full bg-forge-teal"
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    style={{ background: FORGE_PROGRESS_ACCENT_COLOR }}
                  />
                )}

                {/* Show the label only for the active step; on mobile, show the step count. */}
                <span
                  className={getProgressLabelClassName(isActive, isComplete)}
                >
                  {getProgressLabel(label, isActive, isComplete)}
                </span>
              </div>
            );
          })}
        </div>
      </LazyMotion>
    </>
  );
}
