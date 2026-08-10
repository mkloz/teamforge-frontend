import { useSyncExternalStore } from "react";

import {
  getPrefersReducedMotion,
  getServerPrefersReducedMotion,
  subscribeToPrefersReducedMotion,
} from "@/shared/lib/reduced-motion";

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToPrefersReducedMotion,
    getPrefersReducedMotion,
    getServerPrefersReducedMotion,
  );
}
