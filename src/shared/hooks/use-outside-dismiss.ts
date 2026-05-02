import type { RefObject } from "react";
import { useEventCallback, useOnClickOutside } from "usehooks-ts";

type OutsideDismissEventType =
  | "mousedown"
  | "mouseup"
  | "touchstart"
  | "touchend"
  | "focusin"
  | "focusout";

interface UseOutsideDismissOptions<T extends HTMLElement> {
  enabled?: boolean;
  eventType?: OutsideDismissEventType;
  onDismiss: () => void;
  ref: RefObject<T | null>;
}

export function useOutsideDismiss<T extends HTMLElement>({
  enabled = true,
  eventType = "mousedown",
  onDismiss,
  ref,
}: UseOutsideDismissOptions<T>) {
  const handleOutside = useEventCallback(() => {
    if (!enabled) {
      return;
    }

    onDismiss();
  });

  useOnClickOutside(ref as RefObject<T>, handleOutside, eventType);
}
