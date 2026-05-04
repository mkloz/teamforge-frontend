import { motion } from "framer-motion";

import {
  ANVIL_SPARK_ANIMATIONS,
  ANVIL_SPARK_FILTER,
  ANVIL_SPARK_TRANSITION,
} from "./forge-loading-anvil.constants";

const SPARK_STYLE = {
  filter: ANVIL_SPARK_FILTER,
} as const;

export function AnvilSparks() {
  return (
    <>
      {ANVIL_SPARK_ANIMATIONS.map((spark) => (
        <motion.circle
          key={spark.id}
          cx="110"
          cy="111"
          r={spark.size}
          fill={spark.color}
          style={SPARK_STYLE}
          animate={spark.animate}
          transition={ANVIL_SPARK_TRANSITION}
        />
      ))}
    </>
  );
}
