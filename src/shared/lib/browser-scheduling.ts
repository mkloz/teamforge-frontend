import { hasBrowserWindow } from "@/shared/lib/browser-environment";

export type ScheduledDelayHandle = ReturnType<typeof globalThis.setTimeout>;
export type ScheduledIdleTaskHandle =
  | {
      id: number;
      type: "idle-callback";
    }
  | {
      id: ScheduledDelayHandle;
      type: "timeout";
    };

export type ScheduledAnimationFrameHandle =
  | {
      id: number;
      type: "animation-frame";
    }
  | {
      id: ScheduledDelayHandle;
      type: "timeout";
    };

export function scheduleDelay(callback: () => void, delayMs: number) {
  return globalThis.setTimeout(callback, delayMs);
}

export function cancelDelay(handle: ScheduledDelayHandle) {
  globalThis.clearTimeout(handle);
}

export function scheduleIdleTask(callback: () => void) {
  if (hasBrowserWindow() && typeof window.requestIdleCallback === "function") {
    return {
      id: window.requestIdleCallback(callback, { timeout: 5_000 }),
      type: "idle-callback",
    } satisfies ScheduledIdleTaskHandle;
  }

  return {
    id: scheduleDelay(callback, 1_500),
    type: "timeout",
  } satisfies ScheduledIdleTaskHandle;
}

export function cancelIdleTask(handle: ScheduledIdleTaskHandle) {
  if (handle.type === "idle-callback" && hasBrowserWindow()) {
    window.cancelIdleCallback(handle.id);
    return;
  }

  if (handle.type === "timeout") {
    cancelDelay(handle.id);
  }
}

export function getCurrentTimeMs() {
  return globalThis.performance?.now() ?? Date.now();
}

export function scheduleAnimationFrame(callback: FrameRequestCallback) {
  if (
    hasBrowserWindow() &&
    typeof window.requestAnimationFrame === "function"
  ) {
    return {
      id: window.requestAnimationFrame(callback),
      type: "animation-frame",
    } satisfies ScheduledAnimationFrameHandle;
  }

  return {
    id: scheduleDelay(() => callback(getCurrentTimeMs()), 0),
    type: "timeout",
  } satisfies ScheduledAnimationFrameHandle;
}

export function cancelScheduledAnimationFrame(
  handle: ScheduledAnimationFrameHandle,
) {
  if (handle.type === "animation-frame" && hasBrowserWindow()) {
    window.cancelAnimationFrame(handle.id);
    return;
  }

  if (handle.type === "timeout") {
    cancelDelay(handle.id);
  }
}
