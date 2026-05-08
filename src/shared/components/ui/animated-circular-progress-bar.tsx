import { motion, useSpring, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";

export interface AnimatedCircularProgressBarProps {
  max?: number;
  value?: number;
  min?: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;

  const springValue = useSpring(value, {
    stiffness: 40,
    damping: 10,
  });

  const labelText = useTransform(springValue, (latest) => {
    return `${Math.round(latest)}`;
  });

  const containerStyle: CSSProperties & Record<string, string | number> = {
    "--circle-size": "100px",
    "--circumference": `${circumference}px`,
    "--percent-to-px": `${percentPx}px`,
  };

  const circleStyle: CSSProperties & Record<string, string | number> = {
    stroke: gaugeSecondaryColor,
    "--stroke-percent": 90,
  };

  return (
    <div
      className={cn("relative size-40 font-semibold text-2xl", className)}
      style={containerStyle}
    >
      <svg
        fill="transparent"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={circleStyle}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          transform="rotate(-90 50 50)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={gaugePrimaryColor}
          strokeDasharray={`${circumference}px ${circumference}px`}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset:
              circumference - ((value - min) / (max - min)) * circumference,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="opacity-100"
        />
      </svg>
      <motion.span
        data-current-value={value}
        className="absolute inset-0 m-auto mx-auto flex items-center justify-center text-center transition-none duration-[unset]"
      >
        {labelText}
      </motion.span>
    </div>
  );
}
