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

function getSameOriginUrl(value) {
  const fallbackUrl = new URL("/home", self.location.origin);

  if (typeof value !== "string" || value.trim().length === 0) {
    return fallbackUrl;
  }

  let targetUrl;

  try {
    targetUrl = new URL(value, self.location.origin);
  } catch {
    return fallbackUrl;
  }

  if (targetUrl.origin !== self.location.origin) {
    return fallbackUrl;
  }

  return targetUrl;
}

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  const payloadData = readPayloadData(payload);
  const title = payload.title || "TeamForge";
  const targetUrl = getSameOriginUrl(payload.url || payloadData.link);

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: payload.badge || "/icons/pwa-192x192.png",
      body: payload.body || "You have a new TeamForge update.",
      data: {
        ...payloadData,
        url: targetUrl.href,
      },
      icon: payload.icon || "/icons/pwa-192x192.png",
      tag: payload.tag || payload.notificationId || "teamforge-update",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = getSameOriginUrl(event.notification.data?.url);

  event.waitUntil(
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clients) => {
        const sameOriginClient = clients.find((client) => {
          const clientUrl = new URL(client.url);

          return clientUrl.origin === self.location.origin;
        });

        if (sameOriginClient) {
          return sameOriginClient.navigate(targetUrl.href).then((client) => {
            return client?.focus();
          });
        }

        return self.clients.openWindow(targetUrl.href);
      }),
  );
});
