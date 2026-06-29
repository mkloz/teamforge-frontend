import { m } from "framer-motion";

import {
  ANVIL_LOOP_TRANSITION,
  ANVIL_SPARK_ANIMATIONS,
  ANVIL_SPARK_TRANSITION,
} from "./forge-loading-anvil.constants";

export function AnvilSparks() {
  return (
    <>
      <m.path
        className="origin-[110px_107.75px]"
        d="M99 107.75h22"
        stroke="var(--color-spark-amber)"
        strokeLinecap="round"
        strokeWidth="3"
        animate={{
          scaleX: [1, 1, 1, 1.34, 1.08, 1],
        }}
        transition={ANVIL_LOOP_TRANSITION}
      />
      {ANVIL_SPARK_ANIMATIONS.map((spark) => (
        <m.circle
          key={spark.id}
          cx="110"
          cy="108"
          r={spark.size}
          fill="var(--color-spark-amber)"
          animate={spark.animate}
          transition={ANVIL_SPARK_TRANSITION}
        />
      ))}
    </>
  );
}
