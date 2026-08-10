// @ts-check
/// <reference lib="webworker" />

/**
 * @typedef {Record<string, unknown>} PushPayload
 * @typedef {{ badgeCount?: number; notificationTag?: string; route: string; sentAt: number; type: string; url: string }} PwaServiceWorkerMessage
 * @typedef {WorkerNavigator & { clearAppBadge?: () => Promise<void>; setAppBadge?: (contents?: number) => Promise<void> }} BadgeNavigator
 */

/** @type {ServiceWorkerGlobalScope} */
const serviceWorker = self;
const DEFAULT_NOTIFICATION_ROUTE = "/home?notifications=true";
const PWA_SERVICE_WORKER_MESSAGE_TYPES = {
  notificationClick: "findafew:pwa-notification-click",
  pushReceived: "findafew:pwa-push-received",
};
const APP_EXACT_PATHS = new Set([
  "/",
  "/activity",
  "/download",
  "/explore",
  "/home",
  "/plans/new",
  "/privacy",
  "/profile",
  "/settings",
  "/terms",
]);
const APP_DYNAMIC_PATHS = [
  /^\/group-proposals\/[^/]+$/u,
  /^\/groups\/[^/]+$/u,
  /^\/users\/[^/]+$/u,
];

/** @param {unknown} value */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {unknown} value */
function getString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** @param {PushEvent} event */
function readPushPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    const payload = event.data.json();
    return isRecord(payload) ? payload : {};
  } catch {
    return { body: event.data.text() };
  }
}

/** @param {PushPayload} payload */
function getPayloadData(payload) {
  return isRecord(payload.data) ? payload.data : {};
}

/** @param {string} pathname */
function isAllowedAppPath(pathname) {
  return (
    APP_EXACT_PATHS.has(pathname) ||
    APP_DYNAMIC_PATHS.some((pattern) => pattern.test(pathname))
  );
}

/** @param {unknown} value */
function resolveAppUrl(value) {
  const route = getString(value);

  if (!route?.startsWith("/") || route.startsWith("//")) {
    return new URL(DEFAULT_NOTIFICATION_ROUTE, serviceWorker.location.origin);
  }

  try {
    const target = new URL(route, serviceWorker.location.origin);
    return isAllowedAppPath(target.pathname)
      ? target
      : new URL(DEFAULT_NOTIFICATION_ROUTE, serviceWorker.location.origin);
  } catch {
    return new URL(DEFAULT_NOTIFICATION_ROUTE, serviceWorker.location.origin);
  }
}

/** @param {PushPayload} payload */
function getPushTarget(payload) {
  const data = getPayloadData(payload);
  return resolveAppUrl(data.route ?? payload.url);
}

/** @param {PushPayload} payload */
function getPayloadBadgeCount(payload) {
  const data = getPayloadData(payload);
  const value = data.unreadCount;
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : null;
}

/** @param {number | null} badgeCount */
async function syncPushAppBadge(badgeCount) {
  const badgeNavigator = /** @type {BadgeNavigator} */ (navigator);

  if (badgeCount === null || !badgeNavigator.setAppBadge) {
    return;
  }

  if (badgeCount === 0 && badgeNavigator.clearAppBadge) {
    await badgeNavigator.clearAppBadge();
    return;
  }

  await badgeNavigator.setAppBadge(badgeCount);
}

/** @param {URL} targetUrl @param {string} type @param {{ badgeCount?: number; notificationTag?: string }} [options] */
function createBridgeMessage(targetUrl, type, options = {}) {
  return /** @type {PwaServiceWorkerMessage} */ ({
    ...options,
    route: `${targetUrl.pathname}${targetUrl.search}`,
    sentAt: Date.now(),
    type,
    url: targetUrl.href,
  });
}

async function getWindowClients() {
  return serviceWorker.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
}

/** @param {PwaServiceWorkerMessage} message */
async function broadcastMessage(message) {
  const clients = await getWindowClients();

  for (const client of clients) {
    if (new URL(client.url).origin === serviceWorker.location.origin) {
      client.postMessage(message, []);
    }
  }
}

/** @param {PushPayload} payload @param {URL} targetUrl */
function createNotificationOptions(payload, targetUrl) {
  const data = getPayloadData(payload);
  return {
    badge: getString(payload.badge) ?? "/icons/pwa-192x192.png",
    body: getString(payload.body) ?? "You have a new update.",
    data: {
      ...data,
      route: `${targetUrl.pathname}${targetUrl.search}`,
    },
    icon: getString(payload.icon) ?? "/icons/pwa-192x192.png",
    tag:
      getString(payload.tag) ??
      getString(payload.notificationId) ??
      "findafew-update",
  };
}

/** @param {URL} targetUrl */
async function focusOrOpenTarget(targetUrl) {
  const clients = await getWindowClients();
  const targetPath = `${targetUrl.pathname}${targetUrl.search}`;
  const exactClient = clients.find((client) => {
    const clientUrl = new URL(client.url);
    return (
      clientUrl.origin === serviceWorker.location.origin &&
      `${clientUrl.pathname}${clientUrl.search}` === targetPath
    );
  });
  const appClient =
    exactClient ??
    clients.find(
      (client) => new URL(client.url).origin === serviceWorker.location.origin,
    );

  if (appClient) {
    if (
      `${new URL(appClient.url).pathname}${new URL(appClient.url).search}` !==
      targetPath
    ) {
      await appClient.navigate(targetUrl.href);
    }
    await appClient.focus();
    return appClient;
  }

  return serviceWorker.clients.openWindow(targetUrl.href);
}

/** @param {PushEvent} event */
function handlePush(event) {
  const payload = readPushPayload(event);
  const targetUrl = getPushTarget(payload);
  const badgeCount = getPayloadBadgeCount(payload);
  const options = createNotificationOptions(payload, targetUrl);

  event.waitUntil(
    Promise.all([
      syncPushAppBadge(badgeCount),
      broadcastMessage(
        createBridgeMessage(
          targetUrl,
          PWA_SERVICE_WORKER_MESSAGE_TYPES.pushReceived,
          {
            ...(badgeCount === null ? {} : { badgeCount }),
            notificationTag: options.tag,
          },
        ),
      ),
      serviceWorker.registration.showNotification(
        getString(payload.title) ?? "Findafew",
        options,
      ),
    ]),
  );
}

/** @param {NotificationEvent} event */
function handleNotificationClick(event) {
  event.notification.close();
  const targetUrl = resolveAppUrl(event.notification.data?.route);

  event.waitUntil(
    focusOrOpenTarget(targetUrl).then((client) => {
      client?.postMessage(
        createBridgeMessage(
          targetUrl,
          PWA_SERVICE_WORKER_MESSAGE_TYPES.notificationClick,
          { notificationTag: event.notification.tag },
        ),
        [],
      );

      return client;
    }),
  );
}

serviceWorker.addEventListener("push", handlePush);
serviceWorker.addEventListener("notificationclick", handleNotificationClick);
