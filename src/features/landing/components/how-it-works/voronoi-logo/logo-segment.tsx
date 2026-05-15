import { type MotionValue, motion, useTransform } from "framer-motion";

interface LogoSegmentProps {
  points: string;
  fillOpacity: string;
  smoothProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
  xRange: number[];
  yRange: number[];
  rotateRange: number[];
}

export function LogoSegment({
  points,
  fillOpacity,
  smoothProgress,
  shouldReduceMotion,
  xRange,
  yRange,
  rotateRange,
}: LogoSegmentProps) {
  const x = useTransform(
    smoothProgress,
    [0.5, 0.75, 0.85],
    shouldReduceMotion ? [0, 0, 0] : xRange,
  );
  const y = useTransform(
    smoothProgress,
    [0.5, 0.75, 0.85],
    shouldReduceMotion ? [0, 0, 0] : yRange,
  );
  const rotate = useTransform(
    smoothProgress,
    [0.5, 0.85],
    shouldReduceMotion ? [0, 0] : rotateRange,
  );

  return (
    <motion.polygon
      points={points}
      fill="#0D9488"
      fillOpacity={fillOpacity}
      style={{
        transformOrigin: "52px 68px",
        x,
        y,
        rotate,
      }}
    />
  );
}
