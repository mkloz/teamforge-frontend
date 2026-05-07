import { motion, MotionValue, useTransform } from "framer-motion";

interface PsychometricMarkerProps {
  angle: number;
  smoothProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
}

export function PsychometricMarker({
  angle,
  smoothProgress,
  shouldReduceMotion,
}: PsychometricMarkerProps) {
  const markerOpacity = useTransform(
    smoothProgress,
    [0.05, 0.1, 0.25, 0.35],
    [0, 1, 1, 0],
  );
  const markerX = useTransform(
    smoothProgress,
    [0, 0.25],
    [shouldReduceMotion ? 80 : 100, shouldReduceMotion ? 100 : 140],
  );

  return (
    <motion.div
      style={{
        opacity: markerOpacity,
        rotate: angle,
        x: markerX,
      }}
      className="absolute origin-left"
    >
      <div className="h-2.5 w-2.5 rounded-full bg-forge-teal/40" />
    </motion.div>
  );
}
