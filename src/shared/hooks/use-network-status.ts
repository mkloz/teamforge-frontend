import { useSyncExternalStore } from "react";

import {
  addBrowserDocumentEventListener,
  addBrowserWindowEventListener,
  getBrowserVisibilityState,
  isBrowserOnline,
} from "@/shared/lib/browser-environment";

type NetworkStatusListener = () => void;

const networkStatusListeners = new Set<NetworkStatusListener>();
let unsubscribeBrowserEvents: (() => void) | null = null;
let onlineSnapshot = readOnlineStatus();

function readOnlineStatus() {
  return isBrowserOnline();
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
  if (unsubscribeBrowserEvents) {
    return;
  }

  function handleVisibilityChange() {
    if (getBrowserVisibilityState() === "visible") {
      syncOnlineSnapshot();
    }
  }

  const cleanupFocus = addBrowserWindowEventListener(
    "focus",
    syncOnlineSnapshot,
  );
  const cleanupOnline = addBrowserWindowEventListener(
    "online",
    syncOnlineSnapshot,
  );
  const cleanupOffline = addBrowserWindowEventListener(
    "offline",
    syncOnlineSnapshot,
  );
  const cleanupPageShow = addBrowserWindowEventListener(
    "pageshow",
    syncOnlineSnapshot,
  );
  const cleanupVisibilityChange = addBrowserDocumentEventListener(
    "visibilitychange",
    handleVisibilityChange,
  );

  unsubscribeBrowserEvents = () => {
    cleanupFocus();
    cleanupOnline();
    cleanupOffline();
    cleanupPageShow();
    cleanupVisibilityChange();
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
