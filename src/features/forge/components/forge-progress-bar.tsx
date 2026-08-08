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

function getProgressStepClassName(isActive: boolean, isComplete: boolean) {
  return cn(
    "relative flex h-5 min-w-0 grow basis-0 items-center justify-center overflow-hidden rounded-full transition-all duration-300",
    isActive && "basis-20 sm:basis-0",
    isComplete
      ? "bg-forge-teal/20"
      : isActive
        ? "bg-forge-teal/12 ring-1 ring-forge-teal/40"
        : "bg-muted/60",
  );
}

function getProgressLabelClassName(isActive: boolean, isComplete: boolean) {
  return cn(
    "relative select-none truncate px-2 font-bold text-xs leading-none transition-colors duration-200",
    isActive
      ? "pl-4 text-foreground"
      : isComplete
        ? "text-foreground/60"
        : "text-muted-foreground/40",
  );
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
          className={cn("flex w-full min-w-0 items-center gap-1", className)}
        >
          {steps.map(({ s, label }) => {
            const isActive = s === step;
            const isComplete = s < step;

            return (
              <div
                key={s}
                className={getProgressStepClassName(isActive, isComplete)}
              >
                {isComplete && (
                  <m.span
                    className="absolute inset-0 rounded-full bg-forge-teal/20"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    style={{ transformOrigin: "left" }}
                  />
                )}

                {isActive && (
                  <m.span
                    layoutId="forge-active-pip"
                    className="absolute left-1.5 size-1 rounded-full bg-forge-teal"
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    style={{ background: FORGE_PROGRESS_ACCENT_COLOR }}
                  />
                )}

                <span
                  className={getProgressLabelClassName(isActive, isComplete)}
                >
                  {isActive ? label : isComplete ? "✓" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </LazyMotion>
    </>
  );
}
