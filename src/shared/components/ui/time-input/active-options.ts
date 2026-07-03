import type { RefObject } from "react";

export interface ActiveTimeOptionRefs {
  hourRef: RefObject<HTMLButtonElement | null>;
  minuteRef: RefObject<HTMLButtonElement | null>;
}

export function focusActiveTimeOptions(activeRefs: ActiveTimeOptionRefs) {
  const hourOption = activeRefs.hourRef.current;
  const minuteOption = activeRefs.minuteRef.current;

  hourOption?.scrollIntoView({ block: "center" });
  minuteOption?.scrollIntoView({ block: "center" });
  hourOption?.focus({ preventScroll: true });
}
