import { useSyncExternalStore } from "react";

type NetworkStatusListener = () => void;

const networkStatusListeners = new Set<NetworkStatusListener>();
let unsubscribeBrowserEvents: (() => void) | null = null;
let onlineSnapshot = readOnlineStatus();

function readOnlineStatus() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

function emitNetworkStatusChange() {
  for (const listener of networkStatusListeners) {
    listener();
  }
}

function syncOnlineSnapshot() {
  const nextOnlineSnapshot = readOnlineStatus();

  if (nextOnlineSnapshot === onlineSnapshot) {
    return;
  }

  onlineSnapshot = nextOnlineSnapshot;
  emitNetworkStatusChange();
}

function subscribeBrowserNetworkEvents() {
  if (typeof window === "undefined" || unsubscribeBrowserEvents) {
    return;
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      syncOnlineSnapshot();
    }
  }

  window.addEventListener("focus", syncOnlineSnapshot);
  window.addEventListener("online", syncOnlineSnapshot);
  window.addEventListener("offline", syncOnlineSnapshot);
  window.addEventListener("pageshow", syncOnlineSnapshot);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  unsubscribeBrowserEvents = () => {
    window.removeEventListener("focus", syncOnlineSnapshot);
    window.removeEventListener("online", syncOnlineSnapshot);
    window.removeEventListener("offline", syncOnlineSnapshot);
    window.removeEventListener("pageshow", syncOnlineSnapshot);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    unsubscribeBrowserEvents = null;
  };
}

function subscribeNetworkStatus(listener: NetworkStatusListener) {
  networkStatusListeners.add(listener);
  subscribeBrowserNetworkEvents();
  syncOnlineSnapshot();

  return () => {
    networkStatusListeners.delete(listener);

    if (networkStatusListeners.size === 0) {
      unsubscribeBrowserEvents?.();
    }
  };
}

function getNetworkStatusSnapshot() {
  return onlineSnapshot;
}

export function useNetworkStatus() {
  return useSyncExternalStore(
    subscribeNetworkStatus,
    getNetworkStatusSnapshot,
    () => true,
  );
}
