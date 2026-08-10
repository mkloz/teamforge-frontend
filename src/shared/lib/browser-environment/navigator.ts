export function hasBrowserNavigator() {
  return typeof navigator !== "undefined";
}

export function getBrowserNavigator() {
  return hasBrowserNavigator() ? navigator : null;
}

export function isBrowserOnline() {
  return getBrowserNavigator()?.onLine ?? true;
}

export interface BrowserNetworkInformation {
  effectiveType: string | null;
  saveData: boolean;
}

export function getBrowserNetworkInformation(): BrowserNetworkInformation | null {
  const browserNavigator = getBrowserNavigator();
  const connection = browserNavigator
    ? Reflect.get(browserNavigator, "connection")
    : null;

  if (!connection || typeof connection !== "object") {
    return null;
  }

  const effectiveType = Reflect.get(connection, "effectiveType");
  const saveData = Reflect.get(connection, "saveData");

  return {
    effectiveType: typeof effectiveType === "string" ? effectiveType : null,
    saveData: saveData === true,
  };
}

export function hasBrowserServiceWorker() {
  return "serviceWorker" in (getBrowserNavigator() ?? {});
}

export function getBrowserServiceWorker() {
  return getBrowserNavigator()?.serviceWorker ?? null;
}
