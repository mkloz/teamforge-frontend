import { motion } from "framer-motion";

interface OrbitalRingsProps {
  cx: number;
  cy: number;
  size: number;
}

export function OrbitalRings({ cx, cy, size }: OrbitalRingsProps) {
  return (
    <>
      <motion.circle
        cx={cx}
        cy={cy}
        r={size * 0.45}
        fill="none"
        stroke="var(--color-forge-teal)"
        strokeWidth="1"
        opacity="0.1"
        strokeDasharray="4 12"
        animate={{ rotate: 360 }}
        style={{ originX: cx, originY: cy }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={size * 0.4}
        fill="none"
        stroke="var(--color-forge-teal-light)"
        strokeWidth="0.5"
        opacity="0.15"
        strokeDasharray="2 6"
        animate={{ rotate: -360 }}
        style={{ originX: cx, originY: cy }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}
