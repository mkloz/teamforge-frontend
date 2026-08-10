import type { RefObject } from "react";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";

export interface ActiveTimeOptionRefs {
  hourRef: RefObject<HTMLButtonElement | null>;
  minuteRef: RefObject<HTMLButtonElement | null>;
}

export function focusActiveTimeOptions(activeRefs: ActiveTimeOptionRefs) {
  const hourOption = activeRefs.hourRef.current;
  const minuteOption = activeRefs.minuteRef.current;

  scrollElementIntoView(hourOption, { block: "center", intent: "reveal" });
  scrollElementIntoView(minuteOption, { block: "center", intent: "reveal" });
  hourOption?.focus({ preventScroll: true });
}
