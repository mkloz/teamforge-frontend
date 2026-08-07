import { registerSW } from "virtual:pwa-register";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off.js";
import { lazy, Suspense, useEffect, useState } from "react";

import { router } from "@/router";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import {
  addBrowserWindowEventListener,
  getBrowserLocationHref,
  getBrowserLocationOrigin,
  isBrowserDocumentVisible,
  reloadBrowserLocation,
} from "@/shared/lib/browser-environment";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  type BeforeInstallPromptEvent,
  clearPwaInstallPrompt,
  setPwaInstallPrompt,
} from "@/shared/lib/pwa-install-prompt";
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
  reloadBrowserLocation();
}

function RefreshToastActionLabel() {
  return (
    <>
      <RefreshCw
        className="size-3.5 shrink-0"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>Refresh</span>
    </>
  );
}

function isPwaLaunchSourceValue(value: string) {
  return PWA_LAUNCH_SOURCE_VALUES.some((source) => source === value);
}

function getCleanPwaLaunchHref(currentHref: string) {
  const origin = getBrowserLocationOrigin();
  const url = origin ? new URL(currentHref, origin) : new URL(currentHref);
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

function registerPwaInstallPromptCapture() {
  const cleanupBeforeInstallPrompt = addBrowserWindowEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt,
  );
  const cleanupAppInstalled = addBrowserWindowEventListener(
    "appinstalled",
    handleAppInstalled,
  );

  return () => {
    cleanupBeforeInstallPrompt();
    cleanupAppInstalled();
  };
}

function registerPwaServiceWorker() {
  let updateServiceWorker: ReturnType<typeof registerSW> | null = null;

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      trackPwaServiceWorkerUpdateReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppInfoToast }) => {
        showAppInfoToast("A TeamForge update is ready.", {
          closeButton: true,
          description: "Refresh to use the latest version.",
          duration: PWA_UPDATE_TOAST_DURATION_MS,
          id: PWA_UPDATE_TOAST_ID,
          action: {
            label: <RefreshToastActionLabel />,
            onClick: () => {
              hasRequestedPwaUpdateReload = true;

              showAppInfoToast("Updating TeamForge...", {
                description:
                  "The app will reload once the new version takes control.",
                duration: PWA_UPDATE_TOAST_DURATION_MS,
                id: PWA_UPDATE_TOAST_ID,
              });

              const updatePromise = updateServiceWorker?.(true);

              if (!updatePromise) {
                hasRequestedPwaUpdateReload = false;
                return;
              }

              void updatePromise.catch((error: unknown) => {
                hasRequestedPwaUpdateReload = false;
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
            label: <RefreshToastActionLabel />,
            onClick: reloadForPwaUpdate,
          },
        });

        return undefined;
      });
    },
    onOfflineReady() {
      trackPwaServiceWorkerOfflineReady({ source: "runtime" });

      scheduleDelay(() => {
        if (!isBrowserDocumentVisible()) {
          return;
        }

        void import("@/shared/lib/app-toast").then(
          ({ showAppSuccessToast }) => {
            showAppSuccessToast("TeamForge can now open offline.", {
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

    if (import.meta.env.VITE_AUDIT_AUTH_ENABLED !== "true") {
      registerPwaServiceWorker();
    }

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
    const currentHref = getBrowserLocationHref();

    if (!currentHref) {
      return;
    }

    const cleanHref = getCleanPwaLaunchHref(currentHref);

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

  return isOnline ? null : <OfflineConnectionNotice />;
}

function OfflineConnectionNotice() {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const collapseTimer = scheduleDelay(() => {
      setIsExpanded(false);
    }, OFFLINE_BANNER_COLLAPSE_DELAY_MS);

    return () => {
      cancelDelay(collapseTimer);
    };
  }, [isExpanded]);

  return (
    <div className="fixed top-safe-banner right-3 z-100 w-[min(calc(100vw-1.5rem),24rem)] sm:right-4">
      <output
        aria-hidden={!isExpanded}
        className={cn(
          "flex origin-top-right items-center gap-3 rounded-2xl border border-spark-amber/45 bg-canvas px-4 py-3 font-medium text-ink text-sm shadow-2xl shadow-black/15 transition-[opacity,transform] duration-300 ease-out motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
          isExpanded
            ? "pointer-events-auto translate-x-0 translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-2 -translate-y-1 scale-95 opacity-0",
        )}
      >
        <IconTile
          icon={WifiOff}
          shape="circle"
          size="lg"
          tone="amber"
          className="size-9 bg-spark-amber/15"
          iconClassName="size-4.5"
        />
        <span>
          You are offline. TeamForge will reconnect live activity when your
          connection returns.
        </span>
      </output>

      <button
        type="button"
        aria-label="Show offline connection status"
        aria-hidden={isExpanded}
        title="Show offline status"
        tabIndex={isExpanded ? -1 : undefined}
        onClick={() => setIsExpanded(true)}
        className={cn(
          "absolute top-0 right-0 flex size-12 origin-center items-center justify-center rounded-full border border-spark-amber/45 bg-canvas text-spark-amber shadow-soft-sm transition-[opacity,transform,background-color,border-color,box-shadow] duration-250 ease-out hover:border-spark-amber/70 hover:bg-spark-amber/8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-spark-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
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
