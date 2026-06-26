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

type DismissBoundaryRef = RefObject<HTMLElement | null>;

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

    if (!isNodeEventTarget(event.target)) {
      return;
    }

    if (
      isInsideDismissBoundary(event.target, getDismissBoundaryRefs(ref, refs))
    ) {
      return;
    }

    onDismiss();
  });

  useEventListener(eventType, handleOutside, undefined, { capture: true });
}

function isNodeEventTarget(target: EventTarget | null): target is Node {
  return target instanceof Node;
}

function getDismissBoundaryRefs(
  ref: UseOutsideDismissOptions["ref"],
  refs: UseOutsideDismissOptions["refs"],
): DismissBoundaryRef[] {
  return [...(ref ? [ref] : []), ...normalizeDismissBoundaryRefs(refs)];
}

function normalizeDismissBoundaryRefs(
  refs: UseOutsideDismissOptions["refs"],
): DismissBoundaryRef[] {
  if (!refs) {
    return [];
  }

  return Array.isArray(refs) ? refs : [refs];
}

function isInsideDismissBoundary(
  target: Node,
  boundaryRefs: DismissBoundaryRef[],
) {
  return boundaryRefs.some((boundaryRef) =>
    boundaryRef.current?.contains(target),
  );
}
