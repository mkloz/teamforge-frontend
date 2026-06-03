import { registerSW } from "virtual:pwa-register";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off.js";
import { lazy, Suspense, useEffect, useState } from "react";

import { router } from "@/router";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { scheduleDelay } from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  type BeforeInstallPromptEvent,
  clearPwaInstallPrompt,
  setPwaInstallPrompt,
} from "@/shared/lib/pwa-install-prompt";
import { recordPwaServiceWorkerUpdate } from "@/shared/lib/pwa-runtime-diagnostics";
import {
  trackPwaAppInstalled,
  trackPwaInstallPromptAvailable,
  trackPwaServiceWorkerOfflineReady,
  trackPwaServiceWorkerUpdateReady,
} from "@/shared/lib/pwa-telemetry";
import { cn } from "@/shared/lib/utils";

function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof event.prompt === "function" &&
    "userChoice" in event
  );
}

const OFFLINE_BANNER_COLLAPSE_DELAY_MS = 6_000;
const PWA_OFFLINE_READY_TOAST_DELAY_MS = 4_000;
const PWA_UPDATE_TOAST_ID = "teamforge-pwa-update";
const PWA_UPDATE_TOAST_DURATION_MS = 24 * 60 * 60 * 1000;
const PWA_LAUNCH_SOURCE_VALUES = ["pwa", "pwa-shortcut"] as const;
let hasRequestedPwaUpdateReload = false;
let hasReloadedForPwaUpdate = false;

const LazyPwaAuthenticatedRuntime = lazy(() =>
  import("@/app/runtime/pwa-authenticated-runtime").then((module) => ({
    default: module.PwaAuthenticatedRuntime,
  })),
);

function reloadForPwaUpdate() {
  if (hasReloadedForPwaUpdate) {
    return;
  }

  hasReloadedForPwaUpdate = true;
  window.location.reload();
}

function isPwaLaunchSourceValue(value: string) {
  return PWA_LAUNCH_SOURCE_VALUES.some((source) => source === value);
}

function getCleanPwaLaunchHref(currentHref: string) {
  const url = new URL(currentHref, window.location.origin);
  const sourceValues = url.searchParams.getAll("source");
  const hasPwaLaunchSource = sourceValues.some(isPwaLaunchSourceValue);

  if (!hasPwaLaunchSource) {
    return null;
  }

  url.searchParams.delete("source");

  for (const sourceValue of sourceValues) {
    if (!isPwaLaunchSourceValue(sourceValue)) {
      url.searchParams.append("source", sourceValue);
    }
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function registerPwaInstallPromptCapture() {
  function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault();

    if (isBeforeInstallPromptEvent(event)) {
      setPwaInstallPrompt(event);
      trackPwaInstallPromptAvailable({
        platformCount: event.platforms.length,
        platforms: event.platforms.join(","),
        source: "runtime",
      });
    }
  }

  function handleAppInstalled() {
    clearPwaInstallPrompt();
    trackPwaAppInstalled({ source: "runtime" });
  }

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}

function registerPwaServiceWorker() {
  let updateServiceWorker: ReturnType<typeof registerSW> | null = null;

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      recordPwaServiceWorkerUpdate("success", "update waiting");
      trackPwaServiceWorkerUpdateReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppInfoToast }) => {
        showAppInfoToast("A fresh TeamForge update is ready.", {
          closeButton: true,
          description: "Refresh when you have a moment.",
          duration: PWA_UPDATE_TOAST_DURATION_MS,
          id: PWA_UPDATE_TOAST_ID,
          action: {
            label: "Refresh",
            onClick: () => {
              hasRequestedPwaUpdateReload = true;
              recordPwaServiceWorkerUpdate("running", "update requested");

              showAppInfoToast("Updating TeamForge...", {
                description:
                  "The app will reload once the new version takes control.",
                duration: PWA_UPDATE_TOAST_DURATION_MS,
                id: PWA_UPDATE_TOAST_ID,
              });

              const updatePromise = updateServiceWorker?.(true);

              if (!updatePromise) {
                hasRequestedPwaUpdateReload = false;
                recordPwaServiceWorkerUpdate(
                  "error",
                  "update helper unavailable",
                );
                return;
              }

              void updatePromise.catch((error: unknown) => {
                hasRequestedPwaUpdateReload = false;
                recordPwaServiceWorkerUpdate(
                  "error",
                  "update requested",
                  error,
                );
                warnInDevelopment("PWA service worker update failed.", error);

                void import("@/shared/lib/app-toast").then(
                  ({ showAppErrorMessageToast }) => {
                    showAppErrorMessageToast(
                      "TeamForge could not apply that update.",
                      {
                        closeButton: true,
                        description: "Try refreshing again in a moment.",
                        duration: 6000,
                        id: PWA_UPDATE_TOAST_ID,
                      },
                    );

                    return undefined;
                  },
                );
              });
            },
          },
        });

        return undefined;
      });
    },
    onNeedReload() {
      recordPwaServiceWorkerUpdate("success", "new version active");

      if (hasRequestedPwaUpdateReload) {
        reloadForPwaUpdate();
        return;
      }

      void import("@/shared/lib/app-toast").then(({ showAppInfoToast }) => {
        showAppInfoToast("TeamForge finished updating.", {
          closeButton: true,
          description: "Refresh to switch to the new version.",
          duration: PWA_UPDATE_TOAST_DURATION_MS,
          id: PWA_UPDATE_TOAST_ID,
          action: {
            label: "Refresh",
            onClick: reloadForPwaUpdate,
          },
        });

        return undefined;
      });
    },
    onOfflineReady() {
      trackPwaServiceWorkerOfflineReady({ source: "runtime" });

      scheduleDelay(() => {
        if (document.visibilityState === "hidden") {
          return;
        }

        void import("@/shared/lib/app-toast").then(
          ({ showAppSuccessToast }) => {
            showAppSuccessToast("TeamForge is ready for offline launches.", {
              id: "teamforge-pwa-offline-ready",
            });

            return undefined;
          },
        );
      }, PWA_OFFLINE_READY_TOAST_DELAY_MS);
    },
    onRegisterError(error) {
      warnInDevelopment("PWA service worker registration failed.", error);
    },
  });
}

export function PwaRuntime() {
  useEffect(() => {
    const unregisterInstallPromptCapture = registerPwaInstallPromptCapture();

    registerPwaServiceWorker();

    return unregisterInstallPromptCapture;
  }, []);

  return (
    <>
      <PwaLaunchSourceCleanupRuntime />
      <DeferredPwaAuthenticatedRuntime />
      <OfflineConnectionBanner />
    </>
  );
}

function PwaLaunchSourceCleanupRuntime() {
  useEffect(() => {
    const cleanHref = getCleanPwaLaunchHref(window.location.href);

    if (!cleanHref) {
      return;
    }

    router.history.replace(cleanHref);
  }, []);

  return null;
}

function DeferredPwaAuthenticatedRuntime() {
  const { isAuthenticated } = useAuthSessionState();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyPwaAuthenticatedRuntime />
    </Suspense>
  );
}

function OfflineConnectionBanner() {
  const isOnline = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (isOnline) {
      setIsExpanded(true);
      return undefined;
    }

    if (!isExpanded) {
      return undefined;
    }

    const collapseTimer = window.setTimeout(() => {
      setIsExpanded(false);
    }, OFFLINE_BANNER_COLLAPSE_DELAY_MS);

    return () => {
      window.clearTimeout(collapseTimer);
    };
  }, [isExpanded, isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-safe-banner right-3 z-100 w-[min(calc(100vw-1.5rem),24rem)] sm:right-4">
      <div
        role="status"
        aria-hidden={!isExpanded}
        className={cn(
          "flex origin-top-right items-center gap-3 rounded-2xl border border-spark-amber/45 bg-canvas px-4 py-3 font-medium text-ink text-sm shadow-2xl shadow-black/15 transition-[opacity,transform] duration-300 ease-out motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
          isExpanded
            ? "pointer-events-auto translate-x-0 translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-2 -translate-y-1 scale-95 opacity-0",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-spark-amber/15 text-spark-amber">
          <WifiOff size={18} strokeWidth={2} aria-hidden="true" />
        </span>
        <span>
          You are offline. TeamForge will reconnect live activity when your
          connection returns.
        </span>
      </div>

      <button
        type="button"
        aria-label="Show offline connection status"
        aria-hidden={isExpanded}
        title="Show offline status"
        tabIndex={isExpanded ? -1 : undefined}
        onClick={() => setIsExpanded(true)}
        className={cn(
          "absolute top-0 right-0 flex size-12 origin-center items-center justify-center rounded-full border border-spark-amber/45 bg-canvas text-spark-amber shadow-2xl shadow-black/15 transition-[opacity,transform,background-color] duration-250 ease-out hover:bg-spark-amber/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
          isExpanded
            ? "pointer-events-none translate-x-2 -translate-y-1 scale-75 opacity-0"
            : "pointer-events-auto translate-x-0 translate-y-0 scale-100 opacity-100 hover:scale-105 active:scale-95",
        )}
      >
        <WifiOff size={19} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
