import { type MotionValue, motion, useTransform } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProgressBarStepProps {
  index: number;
  smoothProgress: MotionValue<number>;
  onClick?: () => void;
}

export function ProgressBarStep({
  index,
  smoothProgress,
  onClick,
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
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={onClick}
      className="group rounded-full focus-visible:ring-forge-teal focus-visible:ring-offset-8 focus-visible:ring-offset-transparent"
      aria-label={`Go to step ${index + 1}`}
    >
      <motion.div
        style={{ opacity, scale }}
        className={cn(
          "h-2 w-2 rounded-full bg-forge-teal transition-all duration-300",
          "shadow-[0_0_8px_rgba(13,148,136,0.3)] group-hover:shadow-[0_0_12px_rgba(13,148,136,0.5)]",
        )}
      />
    </Button>
  );
}
