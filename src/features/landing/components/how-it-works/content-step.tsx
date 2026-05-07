import {
  motion,
  MotionValue,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useState } from "react";
import type { Step } from "@/features/landing/components/how-it-works/how-it-works-data";

interface ContentStepProps {
  step: Step;
  index: number;
  smoothProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
  isLast: boolean;
}

export function ContentStep({
  step,
  index,
  smoothProgress,
  shouldReduceMotion,
  isLast,
}: ContentStepProps) {
  const start = index * 0.25;
  const end = (index + 1) * 0.25;

  const [isActive, setIsActive] = useState(false);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const active = latest >= start && latest <= (isLast ? 1.1 : end);
    if (active !== isActive) {
      setIsActive(active);
    }
  });

  const opacity = useTransform(
    smoothProgress,
    [
      index === 0 ? -0.1 : start,
      index === 0 ? 0 : start + 0.05,
      isLast ? 1 : end - 0.05,
      isLast ? 1.1 : end,
    ],
    [index === 0 ? 1 : 0, 1, 1, isLast ? 1 : 0],
  );

  const y = useTransform(
    smoothProgress,
    [
      index === 0 ? -0.1 : start,
      index === 0 ? 0 : start + 0.05,
      isLast ? 1 : end - 0.05,
      isLast ? 1.1 : end,
    ],
    shouldReduceMotion
      ? [0, 0, 0, 0]
      : [index === 0 ? 0 : 20, 0, 0, isLast ? 0 : -20],
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center px-4 md:px-0"
      aria-hidden={!isActive}
    >
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 font-sans text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink md:text-5xl">
          {step.title}
        </h3>
        <p className="mb-4 font-sans text-lg leading-relaxed text-pretty text-slate-muted">
          {step.description}
        </p>

        {step.accent && (
          <div className="pointer-events-auto">{step.accent}</div>
        )}
      </div>
    </motion.div>
  );
}
