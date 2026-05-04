import { motion } from "framer-motion";

import {
  ANVIL_ANIMATION_TIMING,
  ANVIL_LOOP_TRANSITION,
} from "./forge-loading-anvil.constants";

interface AnvilBaseProps {
  anvilGradientId: string;
}

export function AnvilBase({ anvilGradientId }: AnvilBaseProps) {
  return (
    <motion.g
      style={{ transformOrigin: "110px 148px" }}
      animate={{
        scaleY: [1, 1, 1, 0.965, 1.01, 1],
        y: [0, 0, 0, 1.25, -0.25, 0],
      }}
      transition={{
        ...ANVIL_LOOP_TRANSITION,
        ease: ["easeOut", "easeInOut", "easeIn", "easeOut", "easeInOut"],
        times: ANVIL_ANIMATION_TIMING,
      }}
    >
      <path
        d="M63 111h91c5 0 8 5 5 9l-10 13c-2 3-6 5-10 5H82c-4 0-8-2-10-5l-13-16c-2-3 0-6 4-6Z"
        fill={`url(#${anvilGradientId})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
      />
      <path
        d="M47 104h47l11 7H62c-9 0-16-2-21-6-2-1-1-1 6-1ZM154 104h22c6 0 8 3 3 7l-20 15-9-10 14-5h-16l6-7Z"
        fill="#242421"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
      />
      <path
        d="M80 138h60l-7 18H87l-7-18Z"
        fill="#1A1A18"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1.5"
      />
      <path
        d="M72 111h72"
        stroke="rgba(255,255,255,0.22)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M88 156h44"
        stroke="var(--color-forge-teal)"
        strokeLinecap="round"
        strokeOpacity="0.38"
        strokeWidth="2"
      />
    </motion.g>
  );
}
