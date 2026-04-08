import { AnimatePresence, motion } from "framer-motion";
import type { DisplayNode, Phase } from "./algorithm-types";

const PARTICLE_RANDOMS = (() => {
  const map = new Map<number, { duration: number; delay: number }>();
  for (let i = 1; i <= 20; i++) {
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const val1 = Math.abs(r1);
    const val2 = Math.abs(r2);
    map.set(i, {
      duration: 0.6 + val1 * 0.6,
      delay: val2 * 0.5,
    });
  }
  return map;
})();

interface DataParticlesProps {
  nodes: DisplayNode[];
  phase: Phase;
  cx: number;
  cy: number;
  size: number;
}

export function DataParticles({
  nodes,
  phase,
  cx,
  cy,
  size,
}: DataParticlesProps) {
  return (
    <AnimatePresence>
      {phase === "evaluating" &&
        nodes
          .filter((n) => n.type !== "center" && n.type !== "rejected")
          .map((node) => {
            const targetRadius = size * 0.36;
            const targetX = cx + Math.cos(node.angle) * targetRadius;
            const targetY = cy + Math.sin(node.angle) * targetRadius;

            const pr = PARTICLE_RANDOMS.get(node.id) || {
              duration: 0.9,
              delay: 0.2,
            };
            return (
              <motion.circle
                key={`particle-${node.id}`}
                r={size * 0.008}
                fill="#FFF"
                initial={{ cx, cy, opacity: 0 }}
                animate={{ cx: targetX, cy: targetY, opacity: [0, 1, 0] }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  duration: pr.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: pr.delay,
                }}
                className="drop-shadow-[0_0_4px_var(--color-forge-teal-light)]"
              />
            );
          })}
    </AnimatePresence>
  );
}
