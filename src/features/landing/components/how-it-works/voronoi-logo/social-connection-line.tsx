import { type MotionValue, motion, useTransform } from "framer-motion";

interface SocialConnectionLineProps {
  x2: number;
  y2: number;
  smoothProgress: MotionValue<number>;
}

export function SocialConnectionLine({
  x2,
  y2,
  smoothProgress,
}: SocialConnectionLineProps) {
  const lineOpacity = useTransform(
    smoothProgress,
    [0.5, 0.6, 0.65, 0.68],
    [0, 0.4, 0.4, 0],
  );
  const linePathLength = useTransform(smoothProgress, [0.5, 0.65], [0, 1]);

  return (
    <motion.line
      x1="50"
      y1="50"
      x2={x2}
      y2={y2}
      stroke="#0D9488"
      strokeWidth="0.5"
      strokeDasharray="4 4"
      animate={{ strokeDashoffset: [0, -20] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{
        opacity: lineOpacity,
        pathLength: linePathLength,
      }}
    />
  );
}
