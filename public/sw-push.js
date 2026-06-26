// @ts-check
/// <reference lib="webworker" />

/**
 * @typedef {Record<string, unknown>} PushPayload
 * @typedef {Record<string, unknown>} PayloadData
 * @typedef {{ panel: string; view?: string }} HomePanelRouteState
 * @typedef {{ type: "clear" } | { badgeCount: number; type: "set" } | { type: "set-empty" }} PushAppBadgeAction
 * @typedef {{ badgeCount?: number | null; notificationTag?: string }} ServiceWorkerMessageOptions
 * @typedef {{ badgeCount?: number; notificationTag?: string; route: string; sentAt: number; type: string; url: string }} PwaServiceWorkerMessage
 * @typedef {(targetUrl: URL) => URL | null} LegacyRouteNormalizer
 * @typedef {WorkerNavigator & { clearAppBadge?: () => Promise<void>; setAppBadge?: (contents?: number) => Promise<void> }} BadgeNavigator
 */

/**
 * Checks that the script is running in a service-worker scope.
 *
 * @param {WorkerGlobalScope & typeof globalThis} scope Worker scope.
 * @returns {scope is ServiceWorkerGlobalScope} Whether the scope has service-worker APIs.
 */
function isServiceWorkerScope(scope) {
  return "clients" in scope && "registration" in scope;
}

/**
 * Returns the service-worker global scope used by this public script.
 *
 * @returns {ServiceWorkerGlobalScope} Service-worker scope.
 */
function getServiceWorkerScope() {
  if (isServiceWorkerScope(self)) {
    return self;
  }

  throw new Error("TeamForge push worker must run in a service worker scope.");
}

const serviceWorker = getServiceWorkerScope();
const DEFAULT_NOTIFICATION_ROUTE = "/home?notifications=true";
const PWA_SERVICE_WORKER_MESSAGE_TYPES = {
  notificationClick: "teamforge:pwa-notification-click",
  pushReceived: "teamforge:pwa-push-received",
};

const APP_EXACT_PATHS = new Set([
  "/",
  "/activity",
  "/download",
  "/explore",
  "/forge",
  "/home",
  "/privacy",
  "/profile",
  "/settings",
  "/terms",
]);

const LEGACY_ROUTE_PATTERNS = {
  chat: /^\/chats\/([^/]+)$/,
  chatMessage: /^\/chats\/([^/]+)\/messages\/([^/]+)$/,
  exploreGroup: /^\/explore\/groups\/([^/]+)$/,
  groupPlan: /^\/groups\/([^/]+)\/plans(?:\/([^/]+))?$/,
  legacyProfile: /^\/profile\/([^/]+)$/,
  plan: /^\/plans\/([^/]+)(?:\/proposals(?:\/([^/]+))?)?$/,
  ratingGroup: /^\/ratings\/groups\/([^/]+)$/,
};

/** @type {Record<string, HomePanelRouteState>} */
const HOME_PANEL_ROUTE_STATES = {
  "/friends/requests/incoming": { panel: "friends" },
  "/invites/received": { panel: "invitations", view: "received" },
  "/invites/sent": { panel: "invitations", view: "sent" },
};

const BADGE_COUNT_KEYS = ["badgeCount", "unreadCount", "unread_count"];
const ROUTE_CANDIDATE_KEYS = ["route", "url", "link"];

/** @type {{ clear: "clear"; set: "set"; setEmpty: "set-empty" }} */
const PUSH_APP_BADGE_ACTIONS = {
  clear: "clear",
  set: "set",
  setEmpty: "set-empty",
};

/**
 * Reads the JSON push payload, falling back to a text notification body.
 *
 * @param {PushEvent} event Push event.
 * @returns {PushPayload} Notification payload.
 */
function readPushPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json();
  } catch {
    return {
      title: "TeamForge",
      body: event.data.text(),
    };
  }
}

/**
 * Checks whether a value can be treated as structured payload data.
 *
 * @param {unknown} value Candidate payload data.
 * @returns {value is PayloadData} Whether the value is a plain object.
 */
function isPayloadData(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Reads the nested notification data payload.
 *
 * @param {PushPayload} payload Notification payload.
 * @returns {PayloadData} Nested payload data.
 */
function readPayloadData(payload) {
  if (isPayloadData(payload.data)) {
    return payload.data;
  }

  return {};
}

/**
 * Creates the default notifications route.
 *
 * @returns {URL} Same-origin fallback URL.
 */
function getFallbackUrl() {
  return new URL(DEFAULT_NOTIFICATION_ROUTE, self.location.origin);
}

/**
 * Normalizes non-empty string payload values.
 *
 * @param {unknown} value Candidate string value.
 * @returns {string | null} Trimmed string, or null.
 */
function getStringValue(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * Reads boolean-like payload values.
 *
 * @param {unknown} value Candidate boolean value.
 * @returns {boolean} Whether the value is true.
 */
function getBooleanValue(value) {
  return value === true || value === "true";
}

/**
 * Parses a raw badge count candidate.
 *
 * @param {unknown} value Raw payload value.
 * @returns {number | null} Numeric candidate, or null.
 */
function getBadgeNumberCandidate(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? Number(trimmedValue) : null;
}

/**
 * Converts a payload value into a browser badge count.
 *
 * @param {unknown} value Raw payload value.
 * @returns {number | null} Non-negative badge count, or null.
 */
function getNumericBadgeValue(value) {
  const numericValue = getBadgeNumberCandidate(value);

  return numericValue !== null && Number.isFinite(numericValue)
    ? Math.max(0, Math.floor(numericValue))
    : null;
}

/**
 * Finds the first valid value from ordered payload sources and keys.
 *
 * @template T
 * @param {Array<Record<string, unknown>>} sources Payload sources.
 * @param {string[]} keys Candidate keys.
 * @param {(value: unknown) => T | null} readValue Value reader.
 * @returns {T | null} First valid value, or null.
 */
function getFirstPayloadValue(sources, keys, readValue) {
  for (const source of sources) {
    for (const key of keys) {
      const value = readValue(source[key]);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Reads the badge count from supported payload locations.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @returns {number | null} Badge count, or null.
 */
function getPayloadBadgeCount(payload, payloadData) {
  return getFirstPayloadValue(
    [payloadData, payload],
    BADGE_COUNT_KEYS,
    getNumericBadgeValue,
  );
}

/**
 * Checks whether the payload explicitly clears the app badge.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @returns {boolean} Whether to clear the badge.
 */
function shouldClearAppBadge(payload, payloadData) {
  return (
    getBooleanValue(payloadData.clearBadge) ||
    getBooleanValue(payloadData.clear_badge) ||
    getBooleanValue(payload.clearBadge) ||
    getBooleanValue(payload.clear_badge)
  );
}

/**
 * Returns the optional app-badge navigator surface.
 *
 * @returns {BadgeNavigator | null} Badge-capable navigator candidate.
 */
function getBadgeNavigator() {
  return typeof navigator === "undefined"
    ? null
    : /** @type {BadgeNavigator} */ (navigator);
}

/**
 * Checks if the current browser exposes service-worker badge APIs.
 *
 * @returns {boolean} Whether badge sync can run.
 */
function canSyncPushAppBadge() {
  const badgeNavigator = getBadgeNavigator();

  return (
    typeof badgeNavigator?.setAppBadge === "function" &&
    typeof badgeNavigator.clearAppBadge === "function"
  );
}

/**
 * Determines the badge operation represented by the payload.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @returns {PushAppBadgeAction} Badge action.
 */
function getPushAppBadgeAction(payload, payloadData) {
  if (shouldClearAppBadge(payload, payloadData)) {
    return { type: PUSH_APP_BADGE_ACTIONS.clear };
  }

  const badgeCount = getPayloadBadgeCount(payload, payloadData);

  if (badgeCount === 0) {
    return { type: PUSH_APP_BADGE_ACTIONS.clear };
  }

  return badgeCount === null
    ? { type: PUSH_APP_BADGE_ACTIONS.setEmpty }
    : { badgeCount, type: PUSH_APP_BADGE_ACTIONS.set };
}

/**
 * Applies one app badge action through the optional browser API.
 *
 * @param {PushAppBadgeAction} action Badge action.
 * @returns {Promise<void>} Completion promise.
 */
async function applyPushAppBadgeAction(action) {
  const badgeNavigator = getBadgeNavigator();

  if (!badgeNavigator?.setAppBadge || !badgeNavigator.clearAppBadge) {
    return;
  }

  if (action.type === PUSH_APP_BADGE_ACTIONS.clear) {
    await badgeNavigator.clearAppBadge();
    return;
  }

  if (action.type === PUSH_APP_BADGE_ACTIONS.set) {
    await badgeNavigator.setAppBadge(action.badgeCount);
    return;
  }

  await badgeNavigator.setAppBadge();
}

/**
 * Best-effort syncs the app badge for a push event.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @returns {Promise<void>} Completion promise.
 */
async function syncPushAppBadge(payload, payloadData) {
  if (!canSyncPushAppBadge()) {
    return;
  }

  try {
    await applyPushAppBadgeAction(getPushAppBadgeAction(payload, payloadData));
    // oxlint-disable-next-line inhuman/no-swallowed-catch -- Badge updates are optional; push notification delivery should continue if the browser rejects them.
  } catch (error) {
    void error;
  }
}

/**
 * Reads the route candidate from supported payload locations.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @returns {string | null} Route candidate.
 */
function getPayloadRouteCandidate(payload, payloadData) {
  return getFirstPayloadValue(
    [payloadData, payload],
    ROUTE_CANDIDATE_KEYS,
    getStringValue,
  );
}

/**
 * Removes backend API prefixes from legacy notification URLs.
 *
 * @param {string} pathname URL pathname.
 * @returns {string} App pathname.
 */
function normalizeApiPathname(pathname) {
  return pathname.replace(/^\/api(?:\/v\d+)?(?=\/)/, "");
}

/**
 * Creates a same-origin app URL.
 *
 * @param {string} pathname App pathname.
 * @returns {URL} App URL.
 */
function createAppRoute(pathname) {
  return new URL(pathname, self.location.origin);
}

/**
 * Adds optional search params to a route.
 *
 * @param {URL} route App URL.
 * @param {Array<[string, string | undefined]>} entries Search param entries.
 * @returns {URL} The same route instance.
 */
function setRouteSearchParams(route, entries) {
  for (const [key, value] of entries) {
    if (value) {
      route.searchParams.set(key, value);
    }
  }

  return route;
}

/**
 * Creates the activity route used by chat/plan notification redirects.
 *
 * @param {Array<[string, string | undefined]>} entries Search param entries.
 * @returns {URL} Activity URL.
 */
function createActivityRoute(entries) {
  return setRouteSearchParams(createAppRoute("/activity"), entries);
}

/**
 * Creates a group detail route.
 *
 * @param {string} groupId Group id.
 * @param {Array<[string, string | undefined]>} [entries=[]] Search param entries.
 * @returns {URL} Group URL.
 */
function createGroupRoute(groupId, entries = []) {
  return setRouteSearchParams(createAppRoute(`/groups/${groupId}`), entries);
}

/**
 * Matches a URL pathname against a route pattern.
 *
 * @param {URL} targetUrl Target URL.
 * @param {RegExp} pattern Route pattern.
 * @returns {RegExpExecArray | null} Pattern match.
 */
function getPathMatch(targetUrl, pattern) {
  return pattern.exec(targetUrl.pathname);
}

/**
 * Normalizes the old notifications route.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeNotificationsRoute(targetUrl) {
  return targetUrl.pathname === "/notifications" ? getFallbackUrl() : null;
}

/**
 * Normalizes legacy direct-chat routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeChatRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.chat);

  return match
    ? createActivityRoute([
        ["kind", "dm"],
        ["id", match[1]],
      ])
    : null;
}

/**
 * Normalizes legacy direct-chat message routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeChatMessageRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.chatMessage);

  return match
    ? createActivityRoute([
        ["kind", "dm"],
        ["id", match[1]],
        ["message", match[2]],
      ])
    : null;
}

/**
 * Normalizes legacy group plan routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeGroupPlanRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.groupPlan);

  return match
    ? createGroupRoute(match[1], [
        ["plan", match[2]],
        ["source", "notification"],
      ])
    : null;
}

/**
 * Normalizes legacy plan/proposal routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizePlanRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.plan);

  return match
    ? createActivityRoute([
        ["plan", match[1]],
        ["proposal", match[2]],
      ])
    : null;
}

/**
 * Normalizes legacy explore group routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeExploreGroupRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.exploreGroup);

  return match ? createGroupRoute(match[1]) : null;
}

/**
 * Normalizes legacy public profile routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeLegacyProfileRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.legacyProfile);

  return match ? createAppRoute(`/users/${match[1]}`) : null;
}

/**
 * Normalizes legacy rating group routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeRatingGroupRoute(targetUrl) {
  const match = getPathMatch(targetUrl, LEGACY_ROUTE_PATTERNS.ratingGroup);

  return match ? createGroupRoute(match[1]) : null;
}

/**
 * Normalizes old home-panel deep links.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL | null} Normalized URL, or null.
 */
function normalizeHomePanelRoute(targetUrl) {
  const routeState = HOME_PANEL_ROUTE_STATES[targetUrl.pathname];

  if (!routeState) {
    return null;
  }

  targetUrl.pathname = "/home";
  targetUrl.searchParams.set("panel", routeState.panel);

  if (routeState.view) {
    targetUrl.searchParams.set("view", routeState.view);
  }

  return targetUrl;
}

/** @type {LegacyRouteNormalizer[]} */
const LEGACY_ROUTE_NORMALIZERS = [
  normalizeNotificationsRoute,
  normalizeChatRoute,
  normalizeChatMessageRoute,
  normalizeGroupPlanRoute,
  normalizePlanRoute,
  normalizeExploreGroupRoute,
  normalizeLegacyProfileRoute,
  normalizeRatingGroupRoute,
  normalizeHomePanelRoute,
];

/**
 * Mutates a target URL to remove API path prefixes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {void}
 */
function applyApiPathnameNormalization(targetUrl) {
  const normalizedPathname = normalizeApiPathname(targetUrl.pathname);

  if (normalizedPathname !== targetUrl.pathname) {
    targetUrl.pathname = normalizedPathname;
  }
}

/**
 * Normalizes legacy app routes into current client routes.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {URL} Normalized URL.
 */
function normalizeLegacyRoute(targetUrl) {
  applyApiPathnameNormalization(targetUrl);

  for (const normalizeRoute of LEGACY_ROUTE_NORMALIZERS) {
    const normalizedRoute = normalizeRoute(targetUrl);

    if (normalizedRoute) {
      return normalizedRoute;
    }
  }

  return targetUrl;
}

/**
 * Checks whether a URL is allowed for notification navigation.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {boolean} Whether the app can open the route.
 */
function isAllowedAppRoute(targetUrl) {
  if (APP_EXACT_PATHS.has(targetUrl.pathname)) {
    return true;
  }

  return (
    /^\/groups\/[^/]+$/.test(targetUrl.pathname) ||
    /^\/users\/[^/]+$/.test(targetUrl.pathname)
  );
}

/**
 * Parses a same-origin URL candidate.
 *
 * @param {unknown} value Raw route value.
 * @returns {URL | null} Same-origin URL, or null.
 */
function createSameOriginUrl(value) {
  const routeValue = getStringValue(value);

  if (!routeValue) {
    return null;
  }

  try {
    const targetUrl = new URL(routeValue, self.location.origin);

    return targetUrl.origin === self.location.origin ? targetUrl : null;
  } catch {
    return null;
  }
}

/**
 * Resolves a notification payload route into an allowed app URL.
 *
 * @param {unknown} value Raw route value.
 * @returns {URL} Allowed app URL or fallback URL.
 */
function getSameOriginAppUrl(value) {
  const targetUrl = createSameOriginUrl(value);
  const fallbackUrl = getFallbackUrl();

  if (!targetUrl) {
    return fallbackUrl;
  }

  const normalizedTargetUrl = normalizeLegacyRoute(targetUrl);

  return isAllowedAppRoute(normalizedTargetUrl)
    ? normalizedTargetUrl
    : fallbackUrl;
}

/**
 * Parses a window client URL.
 *
 * @param {WindowClient} client Window client.
 * @returns {URL | null} Parsed URL, or null.
 */
function getClientUrl(client) {
  try {
    return new URL(client.url);
  } catch {
    return null;
  }
}

/**
 * Checks if a window client belongs to this app origin.
 *
 * @param {WindowClient} client Window client.
 * @returns {boolean} Whether the client is same-origin.
 */
function isSameOriginClient(client) {
  const clientUrl = getClientUrl(client);

  return clientUrl?.origin === self.location.origin;
}

/**
 * Checks whether a same-origin client is focused.
 *
 * @param {WindowClient} client Window client.
 * @returns {boolean} Whether the client is focused.
 */
function isFocusedSameOriginClient(client) {
  return isSameOriginClient(client) && client.focused;
}

/**
 * Checks whether a window client already displays the target route.
 *
 * @param {WindowClient} client Window client.
 * @param {URL} targetUrl Target URL.
 * @returns {boolean} Whether the client route matches exactly.
 */
function isSameTargetClient(client, targetUrl) {
  const clientUrl = getClientUrl(client);

  if (!clientUrl) {
    return false;
  }

  return (
    clientUrl.origin === targetUrl.origin &&
    clientUrl.pathname === targetUrl.pathname &&
    clientUrl.search === targetUrl.search
  );
}

/**
 * Checks whether a matched client exposes the window-client surface.
 *
 * @param {Client} client Matched client.
 * @returns {client is WindowClient} Whether the client is a window client.
 */
function isWindowClient(client) {
  return (
    "focus" in client &&
    "focused" in client &&
    "navigate" in client &&
    typeof client.focus === "function" &&
    typeof client.navigate === "function"
  );
}

/**
 * Reads all controlled and uncontrolled window clients.
 *
 * @returns {Promise<WindowClient[]>} Window clients.
 */
async function getWindowClients() {
  const clients = await serviceWorker.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  return clients.filter(isWindowClient);
}

/**
 * Finds a client already at the target URL.
 *
 * @param {WindowClient[]} windowClients Window clients.
 * @param {URL} targetUrl Target URL.
 * @returns {WindowClient | undefined} Matching client.
 */
function findExactTargetClient(windowClients, targetUrl) {
  return windowClients.find((client) => isSameTargetClient(client, targetUrl));
}

/**
 * Finds a client that can be reused for navigation.
 *
 * @param {WindowClient[]} windowClients Window clients.
 * @returns {WindowClient | undefined} Reusable client.
 */
function findReusableAppClient(windowClients) {
  return (
    windowClients.find(isFocusedSameOriginClient) ||
    windowClients.find(isSameOriginClient)
  );
}

/**
 * Navigates an existing app window and focuses it.
 *
 * @param {WindowClient} client Window client.
 * @param {URL} targetUrl Target URL.
 * @returns {Promise<WindowClient>} Focused client.
 */
async function navigateAndFocusClient(client, targetUrl) {
  const navigatedClient = await client.navigate(targetUrl.href);

  return (navigatedClient || client).focus();
}

/**
 * Opens a new app window for a target route.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {Promise<WindowClient | null>} Opened client.
 */
function openTargetWindow(targetUrl) {
  return serviceWorker.clients.openWindow(targetUrl.href);
}

/**
 * Opens a target route and falls back to focusing an existing client.
 *
 * @param {URL} targetUrl Target URL.
 * @param {WindowClient} fallbackClient Existing client.
 * @returns {Promise<WindowClient | null>} Focused or opened client.
 */
async function openTargetWindowWithFallback(targetUrl, fallbackClient) {
  const openedClient = await openTargetWindow(targetUrl);

  return openedClient || fallbackClient.focus();
}

/**
 * Focuses, navigates, or opens the app for a notification target.
 *
 * @param {URL} targetUrl Target URL.
 * @returns {Promise<WindowClient | null>} Focused or opened client.
 */
async function focusOrOpenTargetWindow(targetUrl) {
  const windowClients = await getWindowClients();
  const exactClient = findExactTargetClient(windowClients, targetUrl);

  if (exactClient) {
    return exactClient.focus();
  }

  const appClient = findReusableAppClient(windowClients);

  if (!appClient) {
    return openTargetWindow(targetUrl);
  }

  try {
    return await navigateAndFocusClient(appClient, targetUrl);
  } catch {
    return openTargetWindowWithFallback(targetUrl, appClient);
  }
}

/**
 * Creates a typed bridge message for app windows.
 *
 * @param {string} type Message type.
 * @param {URL} targetUrl Target URL.
 * @param {ServiceWorkerMessageOptions} [options={}] Message options.
 * @returns {PwaServiceWorkerMessage} Window bridge message.
 */
function createPwaServiceWorkerMessage(type, targetUrl, options = {}) {
  return {
    badgeCount:
      typeof options.badgeCount === "number" ? options.badgeCount : undefined,
    notificationTag: getStringValue(options.notificationTag) ?? undefined,
    route: `${targetUrl.pathname}${targetUrl.search}`,
    sentAt: Date.now(),
    type,
    url: targetUrl.href,
  };
}

/**
 * Posts a bridge message to one client when available.
 *
 * @param {Client | null | undefined} client Target client.
 * @param {PwaServiceWorkerMessage} message Bridge message.
 * @returns {void}
 */
function postPwaServiceWorkerMessage(client, message) {
  if (!client || typeof client.postMessage !== "function") {
    return;
  }

  try {
    client.postMessage(message, []);
    // oxlint-disable-next-line inhuman/no-swallowed-catch -- Bridge messages are best-effort; notification delivery should not depend on them.
  } catch (error) {
    void error;
  }
}

/**
 * Broadcasts a bridge message to same-origin app windows.
 *
 * @param {PwaServiceWorkerMessage} message Bridge message.
 * @returns {Promise<void>} Completion promise.
 */
async function broadcastPwaServiceWorkerMessage(message) {
  /** @type {WindowClient[]} */
  let windowClients = [];

  try {
    windowClients = await getWindowClients();
    // oxlint-disable-next-line inhuman/no-swallowed-catch -- Bridge messages are best-effort; notification delivery should not depend on them.
  } catch (error) {
    void error;
    return;
  }

  for (const client of windowClients) {
    if (isSameOriginClient(client)) {
      postPwaServiceWorkerMessage(client, message);
    }
  }
}

/**
 * Reads notification title copy.
 *
 * @param {PushPayload} payload Notification payload.
 * @returns {string} Notification title.
 */
function getNotificationTitle(payload) {
  return getStringValue(payload.title) ?? "TeamForge";
}

/**
 * Reads notification tag.
 *
 * @param {PushPayload} payload Notification payload.
 * @returns {string} Notification tag.
 */
function getNotificationTag(payload) {
  return (
    getStringValue(payload.tag) ??
    getStringValue(payload.notificationId) ??
    "teamforge-update"
  );
}

/**
 * Reads notification icon or badge URLs.
 *
 * @param {unknown} value Raw icon value.
 * @returns {string} Icon URL.
 */
function getNotificationIcon(value) {
  return getStringValue(value) ?? "/icons/pwa-192x192.png";
}

/**
 * Builds the browser notification options.
 *
 * @param {PushPayload} payload Notification payload.
 * @param {PayloadData} payloadData Nested payload data.
 * @param {URL} targetUrl Notification target URL.
 * @returns {NotificationOptions} Browser notification options.
 */
function createPushNotificationOptions(payload, payloadData, targetUrl) {
  return {
    badge: getNotificationIcon(payload.badge),
    body: getStringValue(payload.body) ?? "You have a new TeamForge update.",
    data: {
      ...payloadData,
      route: `${targetUrl.pathname}${targetUrl.search}`,
      url: targetUrl.href,
    },
    icon: getNotificationIcon(payload.icon),
    tag: getNotificationTag(payload),
  };
}

/**
 * Creates the push-received bridge message.
 *
 * @param {URL} targetUrl Notification target URL.
 * @param {number | null} badgeCount Badge count.
 * @param {string} notificationTag Notification tag.
 * @returns {PwaServiceWorkerMessage} Bridge message.
 */
function createPushReceivedMessage(targetUrl, badgeCount, notificationTag) {
  return createPwaServiceWorkerMessage(
    PWA_SERVICE_WORKER_MESSAGE_TYPES.pushReceived,
    targetUrl,
    {
      badgeCount,
      notificationTag,
    },
  );
}

/**
 * Creates the notification-click bridge message.
 *
 * @param {URL} targetUrl Notification target URL.
 * @param {string} notificationTag Notification tag.
 * @returns {PwaServiceWorkerMessage} Bridge message.
 */
function createNotificationClickMessage(targetUrl, notificationTag) {
  return createPwaServiceWorkerMessage(
    PWA_SERVICE_WORKER_MESSAGE_TYPES.notificationClick,
    targetUrl,
    {
      notificationTag,
    },
  );
}

/**
 * Handles incoming browser push events.
 *
 * @param {PushEvent} event Push event.
 * @returns {void}
 */
function handlePushEvent(event) {
  const payload = readPushPayload(event);
  const payloadData = readPayloadData(payload);
  const targetUrl = getSameOriginAppUrl(
    getPayloadRouteCandidate(payload, payloadData),
  );
  const notificationTag = getNotificationTag(payload);
  const badgeCount = getPayloadBadgeCount(payload, payloadData);

  event.waitUntil(
    Promise.all([
      syncPushAppBadge(payload, payloadData),
      broadcastPwaServiceWorkerMessage(
        createPushReceivedMessage(targetUrl, badgeCount, notificationTag),
      ),
      serviceWorker.registration.showNotification(
        getNotificationTitle(payload),
        createPushNotificationOptions(payload, payloadData, targetUrl),
      ),
    ]),
  );
}

/**
 * Handles notification-click navigation.
 *
 * @param {NotificationEvent} event Notification click event.
 * @returns {void}
 */
function handleNotificationClickEvent(event) {
  event.notification.close();

  const targetUrl = getSameOriginAppUrl(
    event.notification.data?.route || event.notification.data?.url,
  );

  event.waitUntil(
    focusOrOpenTargetWindow(targetUrl).then((client) => {
      postPwaServiceWorkerMessage(
        client,
        createNotificationClickMessage(targetUrl, event.notification.tag),
      );
      return undefined;
    }),
  );
}

serviceWorker.addEventListener("push", handlePushEvent);
serviceWorker.addEventListener(
  "notificationclick",
  handleNotificationClickEvent,
);
