import type { CSSProperties } from "react";

import { getBrowserViewportSize } from "@/shared/lib/browser-environment";

interface AnchoredPanelPositionOptions {
  gap?: number;
  panelHeight: number;
  panelWidth: number;
  viewportPadding?: number;
}

interface AnchoredScrollablePanelPositionOptions {
  estimatedContentHeight: number;
  gap?: number;
  listHeightProperty: string;
  minListHeight?: number;
  panelChromeHeight?: number;
  panelWidth: number;
  preferredMinimumBelow?: number;
  preferredPanelHeight: number;
  viewportPadding?: number;
}

type ScrollablePanelStyle = CSSProperties & Record<string, string | number>;

function getAnchoredPanelGeometry(
  anchor: HTMLElement,
  panelWidth: number,
  viewportPadding: number,
) {
  const rect = anchor.getBoundingClientRect();
  const viewport = getBrowserViewportSize();
  const availableWidth = viewport.width - viewportPadding * 2;
  const resolvedWidth = Math.min(
    availableWidth,
    Math.max(panelWidth, rect.width),
  );
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    viewport.width - resolvedWidth - viewportPadding,
  );

  return { left, rect, resolvedWidth, viewport };
}

export function getAnchoredPanelPosition(
  anchor: HTMLElement,
  {
    gap = 8,
    panelHeight,
    panelWidth,
    viewportPadding = 8,
  }: AnchoredPanelPositionOptions,
): ScrollablePanelStyle {
  const { left, rect, resolvedWidth, viewport } = getAnchoredPanelGeometry(
    anchor,
    panelWidth,
    viewportPadding,
  );
  const hasRoomBelow = rect.bottom + gap + panelHeight < viewport.height;
  const top = hasRoomBelow
    ? rect.bottom + gap
    : Math.max(viewportPadding, rect.top - panelHeight - gap);

  return {
    left,
    position: "fixed",
    top,
    width: resolvedWidth,
  };
}

export function getAnchoredScrollablePanelPosition(
  anchor: HTMLElement,
  {
    estimatedContentHeight,
    gap = 8,
    listHeightProperty,
    minListHeight = 48,
    panelChromeHeight = 12,
    panelWidth,
    preferredMinimumBelow = 180,
    preferredPanelHeight,
    viewportPadding = 8,
  }: AnchoredScrollablePanelPositionOptions,
): CSSProperties {
  const { left, rect, resolvedWidth, viewport } = getAnchoredPanelGeometry(
    anchor,
    panelWidth,
    viewportPadding,
  );
  const availableBelow = viewport.height - rect.bottom - gap - viewportPadding;
  const availableAbove = rect.top - gap - viewportPadding;
  const shouldOpenBelow =
    availableBelow >= preferredMinimumBelow || availableBelow >= availableAbove;
  const availableHeight = shouldOpenBelow ? availableBelow : availableAbove;
  const panelHeight = Math.max(
    minListHeight + panelChromeHeight,
    Math.min(preferredPanelHeight, availableHeight, estimatedContentHeight),
  );
  const top = shouldOpenBelow
    ? rect.bottom + gap
    : Math.max(viewportPadding, rect.top - panelHeight - gap);

  return {
    [listHeightProperty]: `${Math.max(
      minListHeight,
      panelHeight - panelChromeHeight,
    )}px`,
    left,
    maxHeight: panelHeight,
    position: "fixed",
    top,
    width: resolvedWidth,
  };
}
