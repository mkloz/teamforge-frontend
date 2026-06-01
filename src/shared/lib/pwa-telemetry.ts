import { trackedEventNames } from "@/shared/lib/telemetry-contract";
import {
  getBrowserNotificationPermission,
  getWebPushSupport,
} from "@/shared/lib/web-push-browser";

type PwaTelemetryValue = string | number | boolean | null | undefined;
type PwaTelemetryContext = Record<string, PwaTelemetryValue>;

export type PwaTelemetrySource =
  | "download"
  | "download-diagnostics"
  | "runtime"
  | "settings"
  | "unknown";

export type PwaInstallPromptTelemetryOutcome =
  | "accepted"
  | "dismissed"
  | "unavailable";

export type PwaPushSubscriptionAction = "disable" | "enable";
export type PwaTelemetryStatus = "error" | "started" | "success";

function getIsIosStandalone() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getPwaDisplayMode() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return window.matchMedia?.("(display-mode: standalone)").matches ||
    getIsIosStandalone()
    ? "standalone"
    : "browser";
}

function getPwaTelemetryContext(context: PwaTelemetryContext = {}) {
  const pushSupport = getWebPushSupport();
  const displayMode = getPwaDisplayMode();

  return {
    displayMode,
    isSecureContext:
      typeof window === "undefined" ? null : window.isSecureContext,
    isStandalone: displayMode === "standalone",
    notificationPermission: getBrowserNotificationPermission(),
    pushSupported: pushSupport.isSupported,
    pushUnsupportedReason: pushSupport.reason,
    ...context,
  };
}

function trackPwaEvent(name: string, context: PwaTelemetryContext = {}) {
  void import("@/shared/lib/telemetry")
    .then(({ trackEvent }) => {
      trackEvent(name, getPwaTelemetryContext(context));

      return undefined;
    })
    .catch(() => undefined);
}

export function trackPwaInstallPromptAvailable(
  context: PwaTelemetryContext = {},
) {
  trackPwaEvent(trackedEventNames.pwaInstallPromptAvailable, context);
}

export function trackPwaInstallPromptOutcome(context: {
  outcome: PwaInstallPromptTelemetryOutcome;
  platform?: string;
  source: PwaTelemetrySource;
}) {
  trackPwaEvent(trackedEventNames.pwaInstallPromptOutcome, context);
}

export function trackPwaAppInstalled(context: PwaTelemetryContext = {}) {
  trackPwaEvent(trackedEventNames.pwaAppInstalled, context);
}

export function trackPwaServiceWorkerUpdateReady(
  context: PwaTelemetryContext = {},
) {
  trackPwaEvent(trackedEventNames.pwaServiceWorkerUpdateReady, context);
}

export function trackPwaServiceWorkerOfflineReady(
  context: PwaTelemetryContext = {},
) {
  trackPwaEvent(trackedEventNames.pwaServiceWorkerOfflineReady, context);
}

export function trackPwaServiceWorkerUpdateCheck(context: {
  isControlled?: boolean;
  serviceWorkerStatus?: string;
  source: PwaTelemetrySource;
  status: PwaTelemetryStatus;
}) {
  trackPwaEvent(trackedEventNames.pwaServiceWorkerUpdateCheck, context);
}

export function trackPwaPushSubscriptionOutcome(context: {
  action: PwaPushSubscriptionAction;
  errorCode?: string;
  errorName?: string;
  hasBrowserEndpoint?: boolean;
  source: PwaTelemetrySource;
  status: "error" | "success";
}) {
  trackPwaEvent(trackedEventNames.pwaPushSubscriptionOutcome, context);
}

export function trackPwaPushTestOutcome(context: {
  disabledCount?: number;
  enabled?: boolean;
  errorName?: string;
  sentCount?: number;
  source: PwaTelemetrySource;
  status: "api-error" | "delivered" | "disabled" | "not-delivered";
  subscriptionCount?: number;
}) {
  trackPwaEvent(trackedEventNames.pwaPushTestOutcome, context);
}
