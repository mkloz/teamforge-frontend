const DEFAULT_NOTIFICATION_ROUTE = "/home?notifications=true";

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

function readPayloadData(payload) {
  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }

  return {};
}

function getFallbackUrl() {
  return new URL(DEFAULT_NOTIFICATION_ROUTE, self.location.origin);
}

function getStringValue(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getPayloadRouteCandidate(payload, payloadData) {
  return (
    getStringValue(payloadData.route) ||
    getStringValue(payloadData.url) ||
    getStringValue(payloadData.link) ||
    getStringValue(payload.route) ||
    getStringValue(payload.url) ||
    getStringValue(payload.link)
  );
}

function normalizeApiPathname(pathname) {
  return pathname.replace(/^\/api(?:\/v\d+)?(?=\/)/, "");
}

function normalizeLegacyRoute(targetUrl) {
  const normalizedPathname = normalizeApiPathname(targetUrl.pathname);

  if (normalizedPathname !== targetUrl.pathname) {
    targetUrl.pathname = normalizedPathname;
  }

  if (targetUrl.pathname === "/notifications") {
    return getFallbackUrl();
  }

  const chatMatch = /^\/chats\/([^/]+)$/.exec(targetUrl.pathname);

  if (chatMatch) {
    const route = new URL("/activity", self.location.origin);
    route.searchParams.set("kind", "dm");
    route.searchParams.set("id", chatMatch[1]);
    return route;
  }

  const chatMessageMatch = /^\/chats\/([^/]+)\/messages\/([^/]+)$/.exec(
    targetUrl.pathname,
  );

  if (chatMessageMatch) {
    const route = new URL("/activity", self.location.origin);
    route.searchParams.set("kind", "dm");
    route.searchParams.set("id", chatMessageMatch[1]);
    route.searchParams.set("message", chatMessageMatch[2]);
    return route;
  }

  const groupPlanMatch = /^\/groups\/([^/]+)\/plans(?:\/([^/]+))?$/.exec(
    targetUrl.pathname,
  );

  if (groupPlanMatch) {
    const route = new URL(`/groups/${groupPlanMatch[1]}`, self.location.origin);

    if (groupPlanMatch[2]) {
      route.searchParams.set("plan", groupPlanMatch[2]);
    }

    route.searchParams.set("source", "notification");
    return route;
  }

  const planMatch = /^\/plans\/([^/]+)(?:\/proposals(?:\/([^/]+))?)?$/.exec(
    targetUrl.pathname,
  );

  if (planMatch) {
    const route = new URL("/activity", self.location.origin);
    route.searchParams.set("plan", planMatch[1]);

    if (planMatch[2]) {
      route.searchParams.set("proposal", planMatch[2]);
    }

    return route;
  }

  const exploreGroupMatch = /^\/explore\/groups\/([^/]+)$/.exec(
    targetUrl.pathname,
  );

  if (exploreGroupMatch) {
    return new URL(`/groups/${exploreGroupMatch[1]}`, self.location.origin);
  }

  const legacyProfileMatch = /^\/profile\/([^/]+)$/.exec(targetUrl.pathname);

  if (legacyProfileMatch) {
    return new URL(`/users/${legacyProfileMatch[1]}`, self.location.origin);
  }

  const ratingGroupMatch = /^\/ratings\/groups\/([^/]+)$/.exec(
    targetUrl.pathname,
  );

  if (ratingGroupMatch) {
    return new URL(`/groups/${ratingGroupMatch[1]}`, self.location.origin);
  }

  if (targetUrl.pathname === "/invites/received") {
    targetUrl.pathname = "/home";
    targetUrl.searchParams.set("panel", "invitations");
    targetUrl.searchParams.set("view", "received");
    return targetUrl;
  }

  if (targetUrl.pathname === "/invites/sent") {
    targetUrl.pathname = "/home";
    targetUrl.searchParams.set("panel", "invitations");
    targetUrl.searchParams.set("view", "sent");
    return targetUrl;
  }

  if (targetUrl.pathname === "/friends/requests/incoming") {
    targetUrl.pathname = "/home";
    targetUrl.searchParams.set("panel", "friends");
    return targetUrl;
  }

  return targetUrl;
}

function isAllowedAppRoute(targetUrl) {
  if (APP_EXACT_PATHS.has(targetUrl.pathname)) {
    return true;
  }

  return (
    /^\/groups\/[^/]+$/.test(targetUrl.pathname) ||
    /^\/users\/[^/]+$/.test(targetUrl.pathname)
  );
}

function getSameOriginAppUrl(value) {
  const fallbackUrl = getFallbackUrl();

  if (!getStringValue(value)) {
    return fallbackUrl;
  }

  let targetUrl;

  try {
    targetUrl = new URL(getStringValue(value), self.location.origin);
  } catch {
    return fallbackUrl;
  }

  if (targetUrl.origin !== self.location.origin) {
    return fallbackUrl;
  }

  const normalizedTargetUrl = normalizeLegacyRoute(targetUrl);

  if (!isAllowedAppRoute(normalizedTargetUrl)) {
    return fallbackUrl;
  }

  return normalizedTargetUrl;
}

function getClientUrl(client) {
  try {
    return new URL(client.url);
  } catch {
    return null;
  }
}

function isSameOriginClient(client) {
  const clientUrl = getClientUrl(client);

  return clientUrl?.origin === self.location.origin;
}

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

async function focusOrOpenTargetWindow(targetUrl) {
  const windowClients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  const exactClient = windowClients.find((client) =>
    isSameTargetClient(client, targetUrl),
  );

  if (exactClient) {
    return exactClient.focus();
  }

  const appClient =
    windowClients.find(
      (client) => isSameOriginClient(client) && client.focused,
    ) || windowClients.find(isSameOriginClient);

  if (appClient) {
    try {
      const navigatedClient = await appClient.navigate(targetUrl.href);
      return (navigatedClient || appClient).focus();
    } catch {
      const openedClient = await self.clients.openWindow(targetUrl.href);

      return openedClient || appClient.focus();
    }
  }

  return self.clients.openWindow(targetUrl.href);
}

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  const payloadData = readPayloadData(payload);
  const title = payload.title || "TeamForge";
  const targetUrl = getSameOriginAppUrl(
    getPayloadRouteCandidate(payload, payloadData),
  );

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: payload.badge || "/icons/pwa-192x192.png",
      body: payload.body || "You have a new TeamForge update.",
      data: {
        ...payloadData,
        route: `${targetUrl.pathname}${targetUrl.search}`,
        url: targetUrl.href,
      },
      icon: payload.icon || "/icons/pwa-192x192.png",
      tag: payload.tag || payload.notificationId || "teamforge-update",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = getSameOriginAppUrl(
    event.notification.data?.route || event.notification.data?.url,
  );

  event.waitUntil(focusOrOpenTargetWindow(targetUrl));
});
