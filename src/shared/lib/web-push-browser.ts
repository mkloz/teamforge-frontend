import { scenarioRuntime } from "virtual:teamforge-scenario-runtime";
import type { WebPushSubscriptionPayload } from "@/shared/api/web-push";
import {
  decodeBrowserBase64,
  getBrowserNavigator,
  hasBrowserNavigator,
  hasBrowserServiceWorker,
  hasBrowserWindow,
  hasBrowserWindowFeature,
  isBrowserSecureContext,
} from "@/shared/lib/browser-environment";

export type BrowserNotificationPermission =
  | NotificationPermission
  | "unsupported";

export type WebPushUnsupportedReason =
  | "insecure-context"
  | "notifications-unavailable"
  | "push-manager-unavailable"
  | "service-worker-unavailable"
  | "window-unavailable";

export type WebPushSupport =
  | {
      isSupported: true;
      reason: null;
    }
  | {
      isSupported: false;
      reason: WebPushUnsupportedReason;
    };

type WebPushBrowserErrorCode =
  | "permission-timeout"
  | "permission-denied"
  | "subscription-missing-keys"
  | "unsupported";

const SERVICE_WORKER_READY_TIMEOUT_MS = 8000;
const NOTIFICATION_PERMISSION_TIMEOUT_MS = 30_000;

type NotificationPermissionRequestResult = NotificationPermission | "timeout";

interface WebPushSupportCheck {
  isUnavailable: () => boolean;
  reason: WebPushUnsupportedReason;
}

interface PushSubscriptionSerializationParts {
  auth?: string;
  endpoint?: string;
  p256dh?: string;
}

interface CompletePushSubscriptionSerializationParts {
  auth: string;
  endpoint: string;
  p256dh: string;
}

const WEB_PUSH_SUPPORT_CHECKS: readonly WebPushSupportCheck[] = [
  {
    isUnavailable: () => !hasBrowserWindow() || !hasBrowserNavigator(),
    reason: "window-unavailable",
  },
  {
    isUnavailable: () => !isBrowserSecureContext(),
    reason: "insecure-context",
  },
  {
    isUnavailable: () => !hasBrowserServiceWorker(),
    reason: "service-worker-unavailable",
  },
  {
    isUnavailable: () => !hasBrowserWindowFeature("PushManager"),
    reason: "push-manager-unavailable",
  },
  {
    isUnavailable: () => !hasBrowserWindowFeature("Notification"),
    reason: "notifications-unavailable",
  },
];

class WebPushBrowserError extends Error {
  readonly code: WebPushBrowserErrorCode;

  constructor(code: WebPushBrowserErrorCode, message: string) {
    super(message);
    this.name = "WebPushBrowserError";
    this.code = code;
  }
}

export function getWebPushSupport(): WebPushSupport {
  if (!scenarioRuntime.allows("push")) {
    return { isSupported: false, reason: "service-worker-unavailable" };
  }

  const failedCheck = WEB_PUSH_SUPPORT_CHECKS.find((check) =>
    check.isUnavailable(),
  );

  return failedCheck
    ? { isSupported: false, reason: failedCheck.reason }
    : { isSupported: true, reason: null };
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (!hasBrowserWindowFeature("Notification")) {
    return "unsupported";
  }

  return Notification.permission;
}

async function withServiceWorkerTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(
          () => resolve(fallback),
          SERVICE_WORKER_READY_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

async function requestNotificationPermissionWithTimeout() {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Notification.requestPermission(),
      new Promise<"timeout">((resolve) => {
        timeoutId = setTimeout(
          () => resolve("timeout"),
          NOTIFICATION_PERMISSION_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function assertWebPushSupported() {
  const support = getWebPushSupport();

  if (!support.isSupported) {
    throw new WebPushBrowserError(
      "unsupported",
      "This browser cannot receive push notifications.",
    );
  }
}

async function readNotificationPermissionForSubscribe(): Promise<NotificationPermissionRequestResult> {
  return Notification.permission === "granted"
    ? "granted"
    : requestNotificationPermissionWithTimeout();
}

function assertNotificationPermissionGranted(
  permission: NotificationPermissionRequestResult,
) {
  if (permission === "timeout") {
    throw new WebPushBrowserError(
      "permission-timeout",
      "Notification permission did not finish. Try again from the browser permission prompt.",
    );
  }

  if (permission !== "granted") {
    throw new WebPushBrowserError(
      "permission-denied",
      "Notification permission was not granted.",
    );
  }
}

async function getReadableServiceWorkerRegistration() {
  const browserNavigator = getBrowserNavigator();

  if (!browserNavigator || !("serviceWorker" in browserNavigator)) {
    return null;
  }

  const registration = await withServiceWorkerTimeout(
    browserNavigator.serviceWorker.getRegistration(),
    undefined,
  );

  if (registration?.active) {
    return registration;
  }

  return withServiceWorkerTimeout(browserNavigator.serviceWorker.ready, null);
}

async function getRequiredServiceWorkerRegistration() {
  const registration = await getReadableServiceWorkerRegistration();

  if (!registration) {
    throw new WebPushBrowserError(
      "unsupported",
      "TeamForge could not prepare push notifications on this device.",
    );
  }

  return registration;
}

function createPushSubscriptionOptions(
  publicKey: string,
): PushSubscriptionOptionsInit {
  return {
    applicationServerKey: urlBase64ToUint8Array(publicKey),
    userVisibleOnly: true,
  };
}

async function getOrCreatePushSubscription(
  registration: ServiceWorkerRegistration,
  publicKey: string,
) {
  const existingSubscription = await registration.pushManager.getSubscription();

  return (
    existingSubscription ??
    registration.pushManager.subscribe(createPushSubscriptionOptions(publicKey))
  );
}

export async function getBrowserPushSubscription() {
  const support = getWebPushSupport();

  if (!support.isSupported) {
    return null;
  }

  const registration = await getReadableServiceWorkerRegistration();

  return registration?.pushManager.getSubscription() ?? null;
}

export async function subscribeBrowserToWebPush(publicKey: string) {
  assertWebPushSupported();
  assertNotificationPermissionGranted(
    await readNotificationPermissionForSubscribe(),
  );

  return getOrCreatePushSubscription(
    await getRequiredServiceWorkerRegistration(),
    publicKey,
  );
}

function readPushSubscriptionSerializationParts(
  subscription: PushSubscription,
): PushSubscriptionSerializationParts {
  const json = subscription.toJSON();

  return {
    auth: json.keys?.auth,
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
  };
}

function assertCompletePushSubscriptionSerializationParts(
  parts: PushSubscriptionSerializationParts,
): asserts parts is CompletePushSubscriptionSerializationParts {
  if (!parts.endpoint || !parts.p256dh || !parts.auth) {
    throw new WebPushBrowserError(
      "subscription-missing-keys",
      "The browser did not return a complete push subscription.",
    );
  }
}

export function serializeBrowserPushSubscription(
  subscription: PushSubscription,
): WebPushSubscriptionPayload {
  const parts = readPushSubscriptionSerializationParts(subscription);
  assertCompletePushSubscriptionSerializationParts(parts);

  return {
    endpoint: parts.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      auth: parts.auth,
      p256dh: parts.p256dh,
    },
  };
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = decodeBrowserBase64(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}
