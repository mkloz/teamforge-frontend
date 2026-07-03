export function hasBrowserNavigator() {
  return typeof navigator !== "undefined";
}

export function getBrowserNavigator() {
  return hasBrowserNavigator() ? navigator : null;
}

export function isBrowserOnline() {
  return getBrowserNavigator()?.onLine ?? true;
}

export function hasBrowserServiceWorker() {
  return "serviceWorker" in (getBrowserNavigator() ?? {});
}

export function getBrowserServiceWorker() {
  return getBrowserNavigator()?.serviceWorker ?? null;
}
