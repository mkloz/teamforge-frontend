import { animate, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TeamForgeLogo } from "../../../../assets/logo";
import { OCEAN_LABELS } from "../../data/type-descriptions";
import {
  toDisplayPercent,
  type OceanVectorWithMeta,
} from "../../utils/score-calculator";

const DIMS = ["O", "C", "E", "A", "N"] as const;

const LOADING_MESSAGES = [
  "Analyzing responses...",
  "Mapping cognitive patterns...",
  "Synthesizing personality vector...",
  "Generating professional profile...",
];

interface CalculatingScreenProps {
  vector: OceanVectorWithMeta;
  onDone: () => void;
}

function AnimatedCounter({ value, delay }: { value: number; delay: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animation: ReturnType<typeof animate> | undefined;
    const timeout = setTimeout(() => {
      animation = animate(0, value, {
        type: "spring",
        stiffness: 40,
        damping: 12,
        onUpdate: (v) => {
          if (nodeRef.current) {
            nodeRef.current.textContent = `${Math.round(v)}%`;
          }
        },
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animation) animation.stop();
    };
  }, [value, delay]);

  return <span ref={nodeRef}>0%</span>;
}

export function CalculatingScreen({ vector, onDone }: CalculatingScreenProps) {
  const controls = useAnimation();
  const barWidths = DIMS.map((dim) => toDisplayPercent(vector, dim));
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycling messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Main animation sequence
  useEffect(() => {
    let mounted = true;
    async function sequence() {
      // Small pause before starting
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!mounted) return;

      // Animate each bar sequentially with a snappy spring
      await controls.start((i) => ({
        width: `${barWidths[i]}%`,
        transition: {
          type: "spring",
          stiffness: 40,
          damping: 12,
          delay: i * 0.25,
        },
      }));

      // Pause to let the user see the final state
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (mounted) onDone();
    }
    sequence();
    return () => {
      mounted = false;
    };
  }, [controls, onDone, barWidths]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-12 lg:py-0">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <TeamForgeLogo className="w-10 h-10 mb-8" showBackground={false} />
      </motion.div>

      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-8 text-forge-teal">
        Computing Personality Vector
      </p>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {DIMS.map((dim, i) => {
          const labels = OCEAN_LABELS[dim];
          const targetValue = barWidths[i];

          return (
            <motion.div
              key={dim}
              className="flex flex-col gap-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, delay: i * 0.15 },
                },
              }}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-xs font-semibold text-slate-700">
                  {labels.label}
                </span>
                <span className="font-sans text-xs font-bold text-forge-teal">
                  <AnimatedCounter value={targetValue} delay={0.6 + i * 0.25} />
                </span>
              </div>
              <div className="w-full rounded-full overflow-hidden h-2 bg-slate-100 relative shadow-inner">
                <motion.div
                  custom={i}
                  animate={controls}
                  initial={{ width: "0%" }}
                  className="absolute top-0 left-0 bottom-0 h-full rounded-full bg-linear-to-r from-teal-400 to-forge-teal shadow-[0_0_12px_rgba(13,148,136,0.4)]"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="h-4 mt-12 overflow-hidden flex justify-center w-full">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="font-sans text-xs font-medium text-slate-400 text-center"
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </div>
    </div>
  );
}
