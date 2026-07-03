import {
  getBrowserComputedStyle,
  getBrowserMediaQuery,
} from "@/shared/lib/browser-environment";

export type CssPropertyPair = readonly [string, string];

interface CollapseStateOptions {
  collapseAt: number;
  enabled?: boolean;
  expandAt: number;
  isCollapsed: boolean;
  position: number;
}

interface CollapsedStateUpdateOptions {
  force: boolean;
  isCollapsed: boolean;
  nextCollapsed: boolean;
}

interface CollapsedStateTransitionOptions {
  applyCollapsedState: () => void;
  applyExpandedState: () => void;
  nextCollapsed: boolean;
}

interface CssCollapseRangeOptions {
  collapsedFallback: number;
  collapsedProperty: string;
  expandedFallback: number;
  expandedProperty: string;
}

export function getNextCollapsedState({
  collapseAt,
  enabled = true,
  expandAt,
  isCollapsed,
  position,
}: CollapseStateOptions) {
  if (!enabled) {
    return false;
  }

  return isCollapsed ? position > expandAt : position >= collapseAt;
}

export function shouldSkipCollapsedStateUpdate({
  force,
  isCollapsed,
  nextCollapsed,
}: CollapsedStateUpdateOptions) {
  return !force && isCollapsed === nextCollapsed;
}

export function applyCollapsedStateTransition({
  applyCollapsedState,
  applyExpandedState,
  nextCollapsed,
}: CollapsedStateTransitionOptions) {
  if (nextCollapsed) {
    applyCollapsedState();
    return;
  }

  applyExpandedState();
}

export function getCssCollapseRange(
  element: HTMLElement,
  {
    collapsedFallback,
    collapsedProperty,
    expandedFallback,
    expandedProperty,
  }: CssCollapseRangeOptions,
) {
  const styles = getBrowserComputedStyle(element);

  if (!styles) {
    return Math.max(expandedFallback - collapsedFallback, 1);
  }

  const expandedHeight = getCssPixelValue(
    styles,
    expandedProperty,
    expandedFallback,
  );
  const collapsedHeight = getCssPixelValue(
    styles,
    collapsedProperty,
    collapsedFallback,
  );

  return Math.max(expandedHeight - collapsedHeight, 1);
}

export function getPrefersReducedMotion() {
  return (
    getBrowserMediaQuery("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

export function getBooleanCssValue(
  condition: boolean,
  trueValue: string,
  falseValue: string,
) {
  return condition ? trueValue : falseValue;
}

export function getCollapsedCssValue(
  collapsed: boolean,
  collapsedValue: string,
  expandedValue: string,
) {
  return getBooleanCssValue(collapsed, collapsedValue, expandedValue);
}

export function getMotionSafeCollapsedCssValue({
  collapsed,
  collapsedValue,
  expandedValue,
  prefersReducedMotion,
}: {
  collapsed: boolean;
  collapsedValue: string;
  expandedValue: string;
  prefersReducedMotion: boolean;
}) {
  return shouldAnimateCollapsedMotion(collapsed, prefersReducedMotion)
    ? collapsedValue
    : expandedValue;
}

export function getMotionSafeActiveCssValue({
  active,
  activeValue,
  inactiveValue,
  prefersReducedMotion,
}: {
  active: boolean;
  activeValue: string;
  inactiveValue: string;
  prefersReducedMotion: boolean;
}) {
  return active || prefersReducedMotion ? activeValue : inactiveValue;
}

export function getMotionSafeRevealDelay({
  collapsed,
  expandedDelay,
  prefersReducedMotion,
}: {
  collapsed: boolean;
  expandedDelay: string;
  prefersReducedMotion: boolean;
}) {
  return collapsed || prefersReducedMotion ? "0ms" : expandedDelay;
}

function shouldAnimateCollapsedMotion(
  collapsed: boolean,
  prefersReducedMotion: boolean,
) {
  return collapsed && !prefersReducedMotion;
}

export function setCssPropertyPairs(
  element: HTMLElement,
  properties: CssPropertyPair[],
) {
  for (const [property, value] of properties) {
    element.style.setProperty(property, value);
  }
}

function getCssPixelValue(
  styles: CSSStyleDeclaration,
  property: string,
  fallback: number,
) {
  const value = Number.parseFloat(styles.getPropertyValue(property));

  return Number.isFinite(value) ? value : fallback;
}
