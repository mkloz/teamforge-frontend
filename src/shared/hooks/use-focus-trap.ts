import { type RefObject, useEffect } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import { getBrowserActiveElement } from "@/shared/lib/browser-environment";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusTrapBoundary {
  first: HTMLElement | null;
  last: HTMLElement | null;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute("disabled"));
}

function getFocusTrapBoundary(container: HTMLElement): FocusTrapBoundary {
  const focusableElements = getFocusableElements(container);

  return {
    first: focusableElements[0] ?? null,
    last: focusableElements.at(-1) ?? null,
  };
}

function hasFocusTrapBoundary(
  boundary: FocusTrapBoundary,
): boundary is { first: HTMLElement; last: HTMLElement } {
  return Boolean(boundary.first && boundary.last);
}

function shouldWrapFocusToEnd(
  event: KeyboardEvent,
  activeElement: Element | null,
  first: HTMLElement,
) {
  return event.shiftKey && activeElement === first;
}

function shouldWrapFocusToStart(
  event: KeyboardEvent,
  activeElement: Element | null,
  last: HTMLElement,
) {
  return !event.shiftKey && activeElement === last;
}

function shouldHandleFocusTrapKey(enabled: boolean, event: KeyboardEvent) {
  return enabled && event.key === "Tab";
}

function getFocusTrapKeydownContext({
  container,
  enabled,
  event,
}: {
  container: HTMLElement | null;
  enabled: boolean;
  event: KeyboardEvent;
}) {
  if (!shouldHandleFocusTrapKey(enabled, event)) {
    return null;
  }

  if (!container) {
    return null;
  }

  const boundary = getFocusTrapBoundary(container);

  if (!hasFocusTrapBoundary(boundary)) {
    return null;
  }

  return {
    activeElement: getBrowserActiveElement(),
    first: boundary.first,
    last: boundary.last,
  };
}

function getFocusWrapTarget({
  activeElement,
  event,
  first,
  last,
}: {
  activeElement: Element | null;
  event: KeyboardEvent;
  first: HTMLElement;
  last: HTMLElement;
}) {
  if (shouldWrapFocusToEnd(event, activeElement, first)) {
    return last;
  }

  if (shouldWrapFocusToStart(event, activeElement, last)) {
    return first;
  }

  return null;
}

function wrapFocus(target: HTMLElement, event: KeyboardEvent) {
  target.focus();
  event.preventDefault();
}

interface UseFocusTrapOptions<T extends HTMLElement> {
  enabled: boolean;
  ref: RefObject<T | null>;
}

export function useFocusTrap<T extends HTMLElement>({
  enabled,
  ref,
}: UseFocusTrapOptions<T>) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const activeElement = getBrowserActiveElement();
    const previouslyFocusedElement =
      activeElement instanceof HTMLElement ? activeElement : null;

    const focusFirstElement = () => {
      const container = ref.current;

      if (!container) {
        return;
      }

      getFocusableElements(container)[0]?.focus();
    };

    queueMicrotask(focusFirstElement);

    return () => {
      previouslyFocusedElement?.focus();
    };
  }, [enabled, ref]);

  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    const context = getFocusTrapKeydownContext({
      container: ref.current,
      enabled,
      event,
    });

    if (!context) {
      return;
    }

    const wrapTarget = getFocusWrapTarget({
      activeElement: context.activeElement,
      event,
      first: context.first,
      last: context.last,
    });

    if (wrapTarget) {
      wrapFocus(wrapTarget, event);
    }
  });

  useEventListener("keydown", handleKeyDown);
}
