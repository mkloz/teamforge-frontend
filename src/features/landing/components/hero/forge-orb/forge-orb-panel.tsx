import { type HTMLMotionProps, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ForgeOrbPanelProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

export function ForgeOrbPanel({
  children,
  className,
  ...props
}: ForgeOrbPanelProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-forge-teal/20 bg-forge-deep-panel/80 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ForgeOrbEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans font-semibold text-forge-teal text-nano uppercase tracking-[0.15em] opacity-90",
        className,
      )}
    >
      {children}
    </p>
  );
}
