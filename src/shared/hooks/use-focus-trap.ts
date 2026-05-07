import { useEffect, type RefObject } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import { getBrowserActiveElement } from "@/shared/lib/browser-environment";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute("disabled"));
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
      return;
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
    const container = ref.current;

    if (!enabled || event.key !== "Tab" || !container) {
      return;
    }

    const focusableElements = getFocusableElements(container);
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (!first || !last) {
      return;
    }

    const activeElement = getBrowserActiveElement();

    if (event.shiftKey && activeElement === first) {
      last.focus();
      event.preventDefault();
      return;
    }

    if (!event.shiftKey && activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  });

  useEventListener("keydown", handleKeyDown);
}
