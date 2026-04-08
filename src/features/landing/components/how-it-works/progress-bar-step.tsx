import { motion, MotionValue, useTransform } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface ProgressBarStepProps {
  index: number;
  smoothProgress: MotionValue<number>;
}

export function ProgressBarStep({
  index,
  smoothProgress,
}: ProgressBarStepProps) {
  const start = index * 0.25;
  const end = (index + 1) * 0.25;

  const opacity = useTransform(
    smoothProgress,
    [start - 0.05, start, end, end + 0.05],
    [0.3, 1, 1, 0.3],
  );
  const scale = useTransform(
    smoothProgress,
    [start - 0.05, start, end, end + 0.05],
    [1, 1.25, 1.25, 1],
  );

  return (
    <motion.div
      style={{ opacity, scale }}
      className={cn(
        "w-2 h-2 rounded-full bg-forge-teal transition-shadow duration-300",
        "shadow-[0_0_8px_rgba(13,148,136,0.3)]",
      )}
    />
  );
}
