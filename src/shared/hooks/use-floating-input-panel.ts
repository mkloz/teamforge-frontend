import { useCallback, useRef, useState, type CSSProperties } from "react";

import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { useFloatingPanelInteractions } from "@/shared/hooks/use-floating-panel-interactions";
import { getBrowserDocumentBody } from "@/shared/lib/browser-environment";
import { getAnchoredPanelPosition } from "@/shared/lib/floating-panel-position";

interface FloatingInputPanelOptions {
  panelHeight: number;
  panelWidth: number;
}

export function useFloatingInputPanel({
  panelHeight,
  panelWidth,
}: FloatingInputPanelOptions) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const portalTarget = getBrowserDocumentBody();

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    setPanelStyle(
      getAnchoredPanelPosition(triggerRef.current, {
        panelHeight,
        panelWidth,
      }),
    );
  }, [panelHeight, panelWidth]);

  const openPanel = useCallback(() => {
    updatePanelPosition();
    setOpen(true);
  }, [updatePanelPosition]);

  useEscapeKey({ enabled: open, onEscape: closePanel });

  useFloatingPanelInteractions({
    enabled: open,
    onDismiss: closePanel,
    onReposition: updatePanelPosition,
    panelRef,
    triggerRef,
  });

  return {
    closePanel,
    open,
    openPanel,
    panelRef,
    panelStyle,
    portalTarget,
    triggerRef,
    updatePanelPosition,
  };
}
