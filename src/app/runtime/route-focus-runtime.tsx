import type { RouterEvents } from "@tanstack/router-core";
import { useEffect } from "react";

import { router } from "@/router";
import {
  cancelScheduledAnimationFrame,
  type ScheduledAnimationFrameHandle,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import {
  getRouteFocusDirection,
  readRouteFocusReturn,
} from "@/shared/navigation/route-focus";

const ROUTE_FOCUS_SOURCE_ATTRIBUTE = "data-route-focus-key";
const ROUTE_FOCUS_TARGET_SELECTOR = "[data-route-focus-target]";
const ROUTE_FOCUS_FALLBACK_SELECTOR = "#main-content, #admin-main";

export function RouteFocusRuntime() {
  useEffect(() => {
    let hasRendered = false;
    let pendingFrame: ScheduledAnimationFrameHandle | null = null;

    const unsubscribe = router.subscribe("onRendered", (event) => {
      if (!hasRendered) {
        hasRendered = true;
        return;
      }

      if (!event.pathChanged) {
        return;
      }

      if (pendingFrame) {
        cancelScheduledAnimationFrame(pendingFrame);
      }

      pendingFrame = scheduleAnimationFrame(() => {
        pendingFrame = null;
        focusRenderedRoute(event);
      });
    });

    return () => {
      unsubscribe();

      if (pendingFrame) {
        cancelScheduledAnimationFrame(pendingFrame);
      }
    };
  }, []);

  return null;
}

export function focusRenderedRoute(
  event: Pick<RouterEvents["onRendered"], "fromLocation" | "toLocation">,
) {
  if (hasFeatureOwnedFocus()) {
    return false;
  }

  const direction = getRouteFocusDirection(
    event.fromLocation?.state,
    event.toLocation.state,
  );
  const returnEntry =
    direction === "back"
      ? readRouteFocusReturn(event.fromLocation?.state)
      : null;
  const target =
    (returnEntry ? findRouteFocusSource(returnEntry.key) : null) ??
    document.querySelector<HTMLElement>(ROUTE_FOCUS_TARGET_SELECTOR) ??
    document.querySelector<HTMLElement>(ROUTE_FOCUS_FALLBACK_SELECTOR);

  if (!isFocusableRouteElement(target)) {
    return false;
  }

  target.focus({ preventScroll: true });
  return true;
}

function findRouteFocusSource(key: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[${ROUTE_FOCUS_SOURCE_ATTRIBUTE}]`),
  ).find((element) => element.dataset.routeFocusKey === key);
}

function hasFeatureOwnedFocus() {
  const activeElement = document.activeElement;

  return (
    activeElement instanceof HTMLElement &&
    activeElement !== document.body &&
    activeElement.closest(
      '[role="dialog"], [aria-modal="true"], [data-route-focus-owner="feature"]',
    ) !== null
  );
}

function isFocusableRouteElement(
  element: HTMLElement | null,
): element is HTMLElement {
  if (!element?.isConnected || element.hidden || element.inert) {
    return false;
  }

  if (element.matches(":disabled, [aria-disabled='true']")) {
    return false;
  }

  return element.getClientRects().length > 0 || isTestEnvironment();
}

function isTestEnvironment() {
  return import.meta.env.MODE === "test";
}
