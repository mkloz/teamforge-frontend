import { useCallback, useEffect, useState } from "react";

import {
  addBrowserDocumentEventListener,
  addBrowserWindowEventListener,
  getBrowserVisibilityState,
} from "@/shared/lib/browser-environment";
import {
  type BrowserNotificationPermission,
  getBrowserNotificationPermission,
  getBrowserPushSubscription,
  getWebPushSupport,
  type WebPushSupport,
} from "@/shared/lib/web-push-browser";

import type { BrowserPushSubscriptionState } from "./types";

export function useBrowserPushSubscriptionState(): BrowserPushSubscriptionState {
  const [support, setSupport] = useState<WebPushSupport>(() =>
    getWebPushSupport(),
  );
  const [permission, setPermission] = useState<BrowserNotificationPermission>(
    () => getBrowserNotificationPermission(),
  );
  const [browserEndpoint, setBrowserEndpoint] = useState<string | null>(null);
  const [isCheckingBrowserSubscription, setIsCheckingBrowserSubscription] =
    useState(false);

  const refreshBrowserSubscription = useCallback(async () => {
    const nextSupport = getWebPushSupport();

    setSupport(nextSupport);
    setPermission(getBrowserNotificationPermission());

    if (!nextSupport.isSupported) {
      setBrowserEndpoint(null);
      return;
    }

    setIsCheckingBrowserSubscription(true);

    try {
      const subscription = await getBrowserPushSubscription();
      setBrowserEndpoint(subscription?.endpoint ?? null);
    } finally {
      setIsCheckingBrowserSubscription(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function syncBrowserState() {
      if (!isActive) {
        return;
      }

      await refreshBrowserSubscription();
    }

    function handleVisibilityChange() {
      if (getBrowserVisibilityState() === "visible") {
        void syncBrowserState();
      }
    }

    void syncBrowserState();

    const cleanupFocus = addBrowserWindowEventListener(
      "focus",
      syncBrowserState,
    );
    const cleanupVisibilityChange = addBrowserDocumentEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      isActive = false;
      cleanupFocus();
      cleanupVisibilityChange();
    };
  }, [refreshBrowserSubscription]);

  return {
    browserEndpoint,
    isCheckingBrowserSubscription,
    permission,
    refreshBrowserSubscription,
    setBrowserEndpoint,
    setPermission,
    support,
  };
}
