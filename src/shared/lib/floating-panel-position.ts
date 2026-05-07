import type { CSSProperties } from "react";

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

export function getAnchoredPanelPosition(
  anchor: HTMLElement,
  {
    gap = 8,
    panelHeight,
    panelWidth,
    viewportPadding = 8,
  }: AnchoredPanelPositionOptions,
): ScrollablePanelStyle {
  const rect = anchor.getBoundingClientRect();
  const availableWidth = window.innerWidth - viewportPadding * 2;
  const resolvedWidth = Math.min(
    availableWidth,
    Math.max(panelWidth, rect.width),
  );
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    window.innerWidth - resolvedWidth - viewportPadding,
  );
  const hasRoomBelow = rect.bottom + gap + panelHeight < window.innerHeight;
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
  const rect = anchor.getBoundingClientRect();
  const availableWidth = window.innerWidth - viewportPadding * 2;
  const resolvedWidth = Math.min(
    availableWidth,
    Math.max(panelWidth, rect.width),
  );
  const availableBelow =
    window.innerHeight - rect.bottom - gap - viewportPadding;
  const availableAbove = rect.top - gap - viewportPadding;
  const shouldOpenBelow =
    availableBelow >= preferredMinimumBelow || availableBelow >= availableAbove;
  const availableHeight = shouldOpenBelow ? availableBelow : availableAbove;
  const panelHeight = Math.max(
    minListHeight + panelChromeHeight,
    Math.min(preferredPanelHeight, availableHeight, estimatedContentHeight),
  );
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    window.innerWidth - resolvedWidth - viewportPadding,
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
