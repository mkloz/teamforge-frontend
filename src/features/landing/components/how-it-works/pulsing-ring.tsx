import { motion, MotionValue, useTransform } from "framer-motion";

interface PulsingRingProps {
  index: number;
  smoothProgress: MotionValue<number>;
}

export function PulsingRing({ index, smoothProgress }: PulsingRingProps) {
  const ringOpacity = useTransform(smoothProgress, [0, 0.1], [0, 0.3]);

  return (
    <motion.div
      style={{
        opacity: ringOpacity,
      }}
      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: index * 1.5 }}
      className="absolute inset-0 rounded-full border border-forge-teal/30"
    />
  );
}
