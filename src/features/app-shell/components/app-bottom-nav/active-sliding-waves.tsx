import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface ActiveSlidingWavesProps {
  label: string;
  isForge: boolean;
}

export function ActiveSlidingWaves({
  label,
  isForge,
}: ActiveSlidingWavesProps) {
  const wave1Class = isForge
    ? "fill-accent/25 dark:fill-accent/15"
    : "fill-primary/25 dark:fill-primary/15";
  const wave2Class = isForge ? "fill-accent" : "fill-primary";
  const textColorClass = isForge
    ? "text-accent-foreground"
    : "text-primary-foreground";

  return (
    <motion.div
      layoutId="active-wave-group"
      className="absolute bottom-full left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-none"
      transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.9 }}
    >
      <svg
        viewBox="0 0 800 64"
        className="w-200 h-16 overflow-visible preserve-3d"
      >
        <path
          d="M 0 64 L 100 64 C 200 64, 280 52, 400 52 C 520 52, 600 64, 700 64 L 800 64 Z"
          className={cn(
            "transition-colors duration-500 ease-in-out",
            wave1Class,
          )}
        />

        <path
          d="M 250 64 C 300 64, 340 44, 400 44 C 460 44, 500 64, 550 64 Z"
          className={cn(
            "transition-colors duration-500 ease-in-out shadow-xl",
            wave2Class,
          )}
        />
      </svg>

      <motion.span
        initial={{ opacity: 0, scale: 0.6, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 22 }}
        transition={{ delay: 0.05, duration: 0.25, type: "spring" }}
        className={cn(
          "absolute text-xs font-bold tracking-wider",
          textColorClass,
        )}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
