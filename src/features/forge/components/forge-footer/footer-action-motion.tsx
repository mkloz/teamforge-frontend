import { m } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type MotionDivProps = ComponentProps<typeof m.div>;

interface FooterActionMotionProps {
  children: ReactNode;
  motionKey: string;
  className?: string;
  isPulsing?: boolean;
  onPointerDown?: MotionDivProps["onPointerDown"];
}

export function FooterActionMotion({
  children,
  className,
  isPulsing = false,
  motionKey,
  onPointerDown,
}: FooterActionMotionProps) {
  return (
    <m.div
      key={motionKey}
      initial={{ opacity: 0, y: 10 }}
      animate={
        isPulsing
          ? { opacity: 1, y: 0, scale: [1, 1.025, 1] }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55 }}
      className={className}
      onPointerDown={onPointerDown}
    >
      {children}
    </m.div>
  );
}
