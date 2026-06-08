import type { RefObject } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

type OutsideDismissEventType =
  | "mousedown"
  | "mouseup"
  | "pointerdown"
  | "touchstart"
  | "touchend"
  | "focusin"
  | "focusout";

interface UseOutsideDismissOptions {
  enabled?: boolean;
  eventType?: OutsideDismissEventType;
  onDismiss: () => void;
  ref?: RefObject<HTMLElement | null>;
  refs?: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>;
}

export function useOutsideDismiss({
  enabled = true,
  eventType = "mousedown",
  onDismiss,
  ref,
  refs,
}: UseOutsideDismissOptions) {
  const handleOutside = useEventCallback((event: Event) => {
    if (!enabled) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const boundaryRefs = [
      ...(ref ? [ref] : []),
      ...(Array.isArray(refs) ? refs : refs ? [refs] : []),
    ];
    const isInside = boundaryRefs.some((boundaryRef) =>
      boundaryRef.current?.contains(target),
    );

    if (isInside) {
      return;
    }

    onDismiss();
  });

  useEventListener(eventType, handleOutside, undefined, { capture: true });
}
