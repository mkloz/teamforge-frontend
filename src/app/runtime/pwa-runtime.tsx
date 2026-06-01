import { registerSW } from "virtual:pwa-register";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

import { useNetworkStatus } from "@/shared/hooks/use-network-status";
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

function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof event.prompt === "function" &&
    "userChoice" in event
  );
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
      trackPwaServiceWorkerUpdateReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppInfoToast }) => {
        showAppInfoToast("A fresh TeamForge update is ready.", {
          id: "teamforge-pwa-update",
          description: "Refresh when you have a moment.",
          action: {
            label: "Refresh",
            onClick: () => {
              void updateServiceWorker?.(true);
            },
          },
        });

        return undefined;
      });
    },
    onOfflineReady() {
      trackPwaServiceWorkerOfflineReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppSuccessToast }) => {
        showAppSuccessToast("TeamForge is ready for offline launches.", {
          id: "teamforge-pwa-offline-ready",
        });

        return undefined;
      });
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

  return <OfflineConnectionBanner />;
}

function OfflineConnectionBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-3 top-safe-banner z-100 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-spark-amber/45 bg-canvas px-4 py-3 font-medium text-ink text-sm shadow-2xl shadow-black/15"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-spark-amber/15 text-spark-amber">
        <WifiOff size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <span>
        You are offline. TeamForge will reconnect live activity when your
        connection returns.
      </span>
    </div>
  );
}
