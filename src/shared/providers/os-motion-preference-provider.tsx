import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";

export function OsMotionPreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
