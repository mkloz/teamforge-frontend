import { getBrowserWindow } from "@/shared/lib/browser-environment";

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
  const browserWindow = getBrowserWindow();

  if (typeof browserWindow?.requestIdleCallback === "function") {
    return {
      id: browserWindow.requestIdleCallback(callback, { timeout: 5_000 }),
      type: "idle-callback",
    } satisfies ScheduledIdleTaskHandle;
  }

  return {
    id: scheduleDelay(callback, 1_500),
    type: "timeout",
  } satisfies ScheduledIdleTaskHandle;
}

export function cancelIdleTask(handle: ScheduledIdleTaskHandle) {
  const browserWindow = getBrowserWindow();

  if (
    handle.type === "idle-callback" &&
    typeof browserWindow?.cancelIdleCallback === "function"
  ) {
    browserWindow.cancelIdleCallback(handle.id);
    return;
  }

  if (handle.type === "timeout") {
    cancelDelay(handle.id);
  }
}

function getCurrentTimeMs() {
  return globalThis.performance?.now() ?? Date.now();
}

export function scheduleAnimationFrame(callback: FrameRequestCallback) {
  const browserWindow = getBrowserWindow();

  if (typeof browserWindow?.requestAnimationFrame === "function") {
    return {
      id: browserWindow.requestAnimationFrame(callback),
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
  const browserWindow = getBrowserWindow();

  if (
    handle.type === "animation-frame" &&
    typeof browserWindow?.cancelAnimationFrame === "function"
  ) {
    browserWindow.cancelAnimationFrame(handle.id);
    return;
  }

  if (handle.type === "timeout") {
    cancelDelay(handle.id);
  }
}
