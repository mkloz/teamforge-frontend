import { motion } from "framer-motion";

import type { OceanVectorWithMeta } from "@/features/onboarding/utils/score-calculator";

import { AnimatedCounter } from "./animated-counter";
import { useCalculationSequence } from "./use-calculation-sequence";

interface CalculatingScreenProps {
  vector: OceanVectorWithMeta;
  onDone: () => void;
}

export function CalculatingScreen({ vector, onDone }: CalculatingScreenProps) {
  const { controls, message, progressRows } = useCalculationSequence({
    onDone,
    vector,
  });

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      <p className="mb-8 font-sans text-xs font-bold uppercase tracking-[0.18em] text-forge-teal">
        Computing Personality Vector
      </p>

      <div className="flex w-full max-w-sm flex-col gap-6">
        {progressRows.map((row, index) => (
          <motion.div
            key={row.dimension}
            className="flex flex-col gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.5, delay: index * 0.15 },
              },
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-xs font-semibold text-foreground/90">
                {row.label}
              </span>
              <span className="font-sans text-xs font-bold text-forge-teal">
                <AnimatedCounter value={row.value} delay={0.6 + index * 0.25} />
              </span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-white/10"
              role="progressbar"
              aria-label={row.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={row.value}
            >
              <motion.div
                custom={index}
                animate={controls}
                initial={{ width: "0%" }}
                className="absolute bottom-0 left-0 top-0 h-full rounded-full bg-linear-to-r from-teal-400 to-forge-teal shadow-[0_0_12px_rgba(13,148,136,0.4)]"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex h-4 w-full justify-center overflow-hidden">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center font-sans text-xs font-medium text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
