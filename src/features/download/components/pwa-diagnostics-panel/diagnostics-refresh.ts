import type {
  PushDiagnosticsState,
  ServiceWorkerDiagnosticsState,
} from "@/features/download/components/pwa-diagnostics-panel/types";
import { trackPwaServiceWorkerUpdateCheck } from "@/shared/lib/pwa-telemetry";

interface RefreshDiagnosticsInput {
  push: PushDiagnosticsState;
  serviceWorker: ServiceWorkerDiagnosticsState;
}

function getServiceWorkerRefreshTask({
  push,
  serviceWorker,
}: RefreshDiagnosticsInput) {
  return push.isOnline
    ? serviceWorker.checkForUpdate()
    : serviceWorker.refresh();
}

function trackDiagnosticsRefreshStarted(
  serviceWorker: ServiceWorkerDiagnosticsState,
) {
  trackPwaServiceWorkerUpdateCheck({
    isControlled: serviceWorker.isControlled,
    serviceWorkerStatus: serviceWorker.status,
    source: "download-diagnostics",
    status: "started",
  });
}

function trackDiagnosticsRefreshError() {
  trackPwaServiceWorkerUpdateCheck({
    source: "download-diagnostics",
    status: "error",
  });
}

export async function refreshPwaDiagnostics({
  push,
  serviceWorker,
}: RefreshDiagnosticsInput) {
  trackDiagnosticsRefreshStarted(serviceWorker);

  const refreshResults = await Promise.resolve()
    .then(() => {
      const serviceWorkerRefresh = getServiceWorkerRefreshTask({
        push,
        serviceWorker,
      });

      return Promise.allSettled([
        serviceWorkerRefresh,
        push.refreshBrowserSubscription(),
      ]);
    })
    .catch(() => null);
  const serviceWorkerResult = refreshResults?.[0];

  if (!serviceWorkerResult || serviceWorkerResult.status !== "fulfilled") {
    trackDiagnosticsRefreshError();
  } else if (serviceWorkerResult.value.status === "error") {
    trackDiagnosticsRefreshError();
  } else {
    trackPwaServiceWorkerUpdateCheck({
      isControlled: serviceWorkerResult.value.isControlled,
      serviceWorkerStatus: serviceWorkerResult.value.status,
      source: "download-diagnostics",
      status: "success",
    });
  }
}
