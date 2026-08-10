import { getBrowserMediaQuery } from "@/shared/lib/browser-environment";

export const REDUCED_MOTION_MEDIA_QUERY =
  "(prefers-reduced-motion: reduce)" as const;

type MotionPreferenceListener = () => void;

const listeners = new Set<MotionPreferenceListener>();
let mediaQuery: MediaQueryList | null | undefined;
let removeMediaQueryListener: (() => void) | null = null;
let lastSnapshot = false;

export function getPrefersReducedMotion() {
  const nextSnapshot = getReducedMotionMediaQuery()?.matches ?? false;
  lastSnapshot = nextSnapshot;
  return nextSnapshot;
}

export function getServerPrefersReducedMotion() {
  return false;
}

export function subscribeToPrefersReducedMotion(
  listener: MotionPreferenceListener,
) {
  listeners.add(listener);

  if (listeners.size === 1) {
    attachMediaQueryListener();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      removeMediaQueryListener?.();
      removeMediaQueryListener = null;
    }
  };
}

function getReducedMotionMediaQuery() {
  if (mediaQuery === undefined) {
    mediaQuery = getBrowserMediaQuery(REDUCED_MOTION_MEDIA_QUERY);
    lastSnapshot = mediaQuery?.matches ?? false;
  }

  return mediaQuery;
}

function attachMediaQueryListener() {
  const preferenceQuery = getReducedMotionMediaQuery();

  if (!preferenceQuery || removeMediaQueryListener) {
    return;
  }

  const handleChange = () => {
    const nextSnapshot = preferenceQuery.matches;

    if (nextSnapshot === lastSnapshot) {
      return;
    }

    lastSnapshot = nextSnapshot;
    for (const listener of listeners) {
      listener();
    }
  };

  if (typeof preferenceQuery.addEventListener === "function") {
    preferenceQuery.addEventListener("change", handleChange);
    removeMediaQueryListener = () => {
      preferenceQuery.removeEventListener("change", handleChange);
    };
    return;
  }

  preferenceQuery.addListener(handleChange);
  removeMediaQueryListener = () => {
    preferenceQuery.removeListener(handleChange);
  };
}
