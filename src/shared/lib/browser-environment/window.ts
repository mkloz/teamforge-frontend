const noopBrowserCleanup = () => undefined;

export function hasBrowserWindow() {
  return typeof window !== "undefined";
}

export function getBrowserWindow() {
  return hasBrowserWindow() ? window : null;
}

export function getBrowserComputedStyle(element: Element) {
  return getBrowserWindow()?.getComputedStyle(element) ?? null;
}

export function getBrowserDevicePixelRatio() {
  return getBrowserWindow()?.devicePixelRatio || 1;
}

export function getBrowserScrollY() {
  return getBrowserWindow()?.scrollY ?? 0;
}

export function getBrowserMediaQuery(query: string) {
  const browserWindow = getBrowserWindow();

  if (!browserWindow || typeof browserWindow.matchMedia !== "function") {
    return null;
  }

  return browserWindow.matchMedia(query);
}

export function reloadBrowserLocation() {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return;
  }

  browserWindow.location.reload();
}

export function addBrowserWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return noopBrowserCleanup;
  }

  browserWindow.addEventListener(type, listener, options);

  return () => {
    browserWindow.removeEventListener(type, listener, options);
  };
}
