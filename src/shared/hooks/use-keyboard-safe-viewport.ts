import { type RefObject, useEffect } from "react";

import {
  getBrowserActiveElement,
  getBrowserDocument,
  getBrowserDocumentElement,
  getBrowserVisualViewport,
  getBrowserWindow,
} from "@/shared/lib/browser-environment";
import {
  cancelScheduledAnimationFrame,
  type ScheduledAnimationFrameHandle,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import {
  clearKeyboardViewportSnapshot,
  getKeyboardViewportSnapshot,
  isKeyboardViewportEditable,
  isKeyboardViewportUnzoomed,
  writeKeyboardViewportSnapshot,
} from "@/shared/lib/keyboard-viewport";

interface KeyboardSafeViewportOptions {
  enabled?: boolean;
}

export function useKeyboardSafeViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled = true }: KeyboardSafeViewportOptions = {},
) {
  useEffect(() => {
    const shell = ref.current;
    const browserDocument = getBrowserDocument();
    const browserWindow = getBrowserWindow();
    const visualViewport = getBrowserVisualViewport();

    if (!enabled || !shell || !browserDocument || !visualViewport) {
      return undefined;
    }

    let animationFrame: ScheduledAnimationFrameHandle | null = null;
    let viewportListenersAttached = false;

    const clearSnapshot = () => clearKeyboardViewportSnapshot(shell);
    const hasEligibleFocus = () => {
      const activeElement = getBrowserActiveElement();
      return (
        activeElement !== null &&
        shell.contains(activeElement) &&
        isKeyboardViewportEditable(activeElement)
      );
    };
    let scheduleUpdate = () => {};
    const detachViewportListeners = () => {
      if (!viewportListenersAttached) {
        return;
      }

      viewportListenersAttached = false;
      visualViewport.removeEventListener("resize", scheduleUpdate);
      visualViewport.removeEventListener("scroll", scheduleUpdate);
      browserWindow?.removeEventListener("resize", scheduleUpdate);
      browserWindow?.removeEventListener("orientationchange", scheduleUpdate);
      browserDocument.removeEventListener("visibilitychange", scheduleUpdate);
    };
    const attachViewportListeners = () => {
      if (viewportListenersAttached) {
        return;
      }

      viewportListenersAttached = true;
      visualViewport.addEventListener("resize", scheduleUpdate);
      visualViewport.addEventListener("scroll", scheduleUpdate);
      browserWindow?.addEventListener("resize", scheduleUpdate);
      browserWindow?.addEventListener("orientationchange", scheduleUpdate);
      browserDocument.addEventListener("visibilitychange", scheduleUpdate);
    };
    const update = () => {
      animationFrame = null;

      if (!hasEligibleFocus()) {
        detachViewportListeners();
        clearSnapshot();
        return;
      }

      attachViewportListeners();
      if (
        browserDocument.visibilityState !== "visible" ||
        !isKeyboardViewportUnzoomed(visualViewport.scale)
      ) {
        clearSnapshot();
        return;
      }

      const documentElement = getBrowserDocumentElement();
      const layoutHeight =
        documentElement?.clientHeight || browserWindow?.innerHeight || 0;
      writeKeyboardViewportSnapshot(
        shell,
        getKeyboardViewportSnapshot({ layoutHeight, viewport: visualViewport }),
      );
    };
    scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = scheduleAnimationFrame(update);
      }
    };

    shell.addEventListener("focusin", scheduleUpdate);
    shell.addEventListener("focusout", scheduleUpdate);
    scheduleUpdate();

    return () => {
      shell.removeEventListener("focusin", scheduleUpdate);
      shell.removeEventListener("focusout", scheduleUpdate);
      detachViewportListeners();
      if (animationFrame) {
        cancelScheduledAnimationFrame(animationFrame);
      }
      clearSnapshot();
    };
  }, [enabled, ref]);
}
