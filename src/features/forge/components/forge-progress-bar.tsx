import { motion } from "framer-motion";
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

const POST_FORGE_PROGRESS_STEPS: ForgeProgressStep[] = [
  { s: 5, label: "Result" },
  { s: 6, label: "Identity" },
  { s: 7, label: "Invite" },
];

const MANUAL_POST_FORGE_PROGRESS_STEPS: ForgeProgressStep[] = [
  { s: 6, label: "Identity" },
  { s: 7, label: "Invite" },
];

const FORGE_PROGRESS_ACCENT_COLOR = "var(--color-forge-teal)";

function getProgressSteps(
  isPreForge: boolean,
  forgeMode: ForgeMode,
): ForgeProgressStep[] {
  if (isPreForge) {
    return PRE_FORGE_PROGRESS_STEPS;
  }

  return forgeMode === "MANUAL"
    ? MANUAL_POST_FORGE_PROGRESS_STEPS
    : POST_FORGE_PROGRESS_STEPS;
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

export function ForgeProgressBar({
  forgeMode,
  step,
  isPreForge,
  className,
}: ForgeProgressBarProps) {
  const steps = getProgressSteps(isPreForge, forgeMode);

  return (
    <div
      className={cn("flex w-full items-center gap-1.5", className)}
      role="progressbar"
      aria-label="Forge progress"
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
              <motion.span
                className="absolute inset-0 rounded-full bg-forge-teal/20"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                style={{ transformOrigin: "left" }}
              />
            )}

            {/* Active indicator dot */}
            {isActive && (
              <motion.span
                layoutId="forge-active-pip"
                className="absolute left-2 size-1.5 rounded-full bg-forge-teal"
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ background: FORGE_PROGRESS_ACCENT_COLOR }}
              />
            )}

            {/* Label — shown only on active step; on mobile show step count */}
            <span className={getProgressLabelClassName(isActive, isComplete)}>
              {getProgressLabel(label, isActive, isComplete)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
