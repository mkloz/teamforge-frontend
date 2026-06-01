import type { WebPushSubscriptionPayload } from "@/shared/api/web-push";

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

export type WebPushBrowserErrorCode =
  | "permission-denied"
  | "subscription-missing-keys"
  | "unsupported";

const SERVICE_WORKER_READY_TIMEOUT_MS = 8000;

export class WebPushBrowserError extends Error {
  readonly code: WebPushBrowserErrorCode;

  constructor(code: WebPushBrowserErrorCode, message: string) {
    super(message);
    this.name = "WebPushBrowserError";
    this.code = code;
  }
}

export function getWebPushSupport(): WebPushSupport {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isSupported: false, reason: "window-unavailable" };
  }

  if (!window.isSecureContext) {
    return { isSupported: false, reason: "insecure-context" };
  }

  if (!("serviceWorker" in navigator)) {
    return { isSupported: false, reason: "service-worker-unavailable" };
  }

  if (!("PushManager" in window)) {
    return { isSupported: false, reason: "push-manager-unavailable" };
  }

  if (!("Notification" in window)) {
    return { isSupported: false, reason: "notifications-unavailable" };
  }

  return { isSupported: true, reason: null };
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
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

async function getReadableServiceWorkerRegistration() {
  const registration = await withServiceWorkerTimeout(
    navigator.serviceWorker.getRegistration(),
    undefined,
  );

  if (registration?.active) {
    return registration;
  }

  return withServiceWorkerTimeout(navigator.serviceWorker.ready, null);
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
  const support = getWebPushSupport();

  if (!support.isSupported) {
    throw new WebPushBrowserError(
      "unsupported",
      "This browser cannot receive push notifications.",
    );
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new WebPushBrowserError(
      "permission-denied",
      "Notification permission was not granted.",
    );
  }

  const registration = await getReadableServiceWorkerRegistration();

  if (!registration) {
    throw new WebPushBrowserError(
      "unsupported",
      "TeamForge could not prepare push notifications on this device.",
    );
  }

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(publicKey),
    userVisibleOnly: true,
  });
}

export function serializeBrowserPushSubscription(
  subscription: PushSubscription,
): WebPushSubscriptionPayload {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    throw new WebPushBrowserError(
      "subscription-missing-keys",
      "The browser did not return a complete push subscription.",
    );
  }

  return {
    endpoint: json.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      auth,
      p256dh,
    },
  };
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}
