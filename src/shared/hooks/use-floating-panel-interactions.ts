import type { RefObject } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import { useOutsideDismiss } from "@/shared/hooks/use-outside-dismiss";

interface UseFloatingPanelInteractionsOptions<
  TTrigger extends HTMLElement,
  TPanel extends HTMLElement,
> {
  enabled: boolean;
  onDismiss: () => void;
  onReposition: () => void;
  panelRef: RefObject<TPanel | null>;
  triggerRef: RefObject<TTrigger | null>;
}

export function useFloatingPanelInteractions<
  TTrigger extends HTMLElement,
  TPanel extends HTMLElement,
>({
  enabled,
  onDismiss,
  onReposition,
  panelRef,
  triggerRef,
}: UseFloatingPanelInteractionsOptions<TTrigger, TPanel>) {
  const dismiss = useEventCallback(onDismiss);
  const reposition = useEventCallback(onReposition);
  const repositionWhenEnabled = useEventCallback(() => {
    if (!enabled) {
      return;
    }

    reposition();
  });

  useOutsideDismiss({
    enabled,
    eventType: "pointerdown",
    onDismiss: dismiss,
    refs: [triggerRef, panelRef],
  });

  useEventListener("resize", repositionWhenEnabled);
  useEventListener("scroll", repositionWhenEnabled, undefined, {
    capture: true,
  });
}
