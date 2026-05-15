import { motion } from "framer-motion";
import type {
  DisplayNode,
  Phase,
} from "@/features/landing/components/algorithm/algorithm-types";

interface AlgoLineProps {
  node: DisplayNode;
  phase: Phase;
  cx: number;
  cy: number;
  size: number;
}

export function AlgoLine({ node, phase, cx, cy, size }: AlgoLineProps) {
  if (node.type === "center") return null;

  const getLineProps = () => {
    if (phase === "idle") return { opacity: 0, stroke: "#0D9488", width: 0.8 };
    if (node.type === "rejected")
      return { opacity: 0.02, stroke: "#374151", width: 0.5 };
    if (node.type === "selected")
      return {
        opacity: 0.65,
        stroke: "#F59E0B",
        width: 1.8,
      };
    return { opacity: 0.15, stroke: "#0D9488", width: 0.8 };
  };

  const lp = getLineProps();
  let targetRadius = size * 0.36;
  if (phase === "selecting" || phase === "formed") {
    if (node.type === "selected") targetRadius = size * 0.22;
    else if (node.type === "rejected") targetRadius = size * 0.48;
  }

  const targetX = cx + Math.cos(node.angle) * targetRadius;
  const targetY = cy + Math.sin(node.angle) * targetRadius;

  return (
    <motion.line
      initial={{ x1: cx, y1: cy, x2: cx, y2: cy }}
      animate={{
        x1: cx,
        y1: cy,
        x2: targetX,
        y2: targetY,
        opacity: lp.opacity,
        stroke: lp.stroke,
        strokeWidth: lp.width,
      }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}
