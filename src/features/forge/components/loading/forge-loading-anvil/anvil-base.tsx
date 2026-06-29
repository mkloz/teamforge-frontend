import { m } from "framer-motion";

import {
  ANVIL_ANIMATION_TIMING,
  ANVIL_LOOP_TRANSITION,
} from "./forge-loading-anvil.constants";

export function AnvilBase() {
  return (
    <m.g
      className="origin-[110px_148px]"
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
        d="M63 111h101l-14 5 9 10-10 7c-2 3-6 5-10 5H82c-4 0-8-2-10-5l-13-16c-2-3 0-6 4-6Z"
        fill="var(--color-forge-teal)"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path
        d="M47 104h39l9 7H62c-9 0-16-2-21-6-2-1-1-1 6-1ZM154 104h22c6 0 8 3 3 7l-20 15-9-10 14-5h-16l6-7Z"
        fill="transparent"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path
        d="M80 138h60l-7 18H87l-7-18Z"
        fill="transparent"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path
        d="M72 111h72"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <path
        d="M88 156h44"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
    </m.g>
  );
}
