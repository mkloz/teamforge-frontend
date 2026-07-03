const noopBrowserCleanup = () => undefined;

interface BrowserViewportSize {
  height: number;
  width: number;
}

export function hasBrowserWindow() {
  return typeof window !== "undefined";
}

export function getBrowserWindow() {
  return hasBrowserWindow() ? window : null;
}

export function getBrowserLocation() {
  return getBrowserWindow()?.location ?? null;
}

export function getBrowserLocationHref() {
  return getBrowserLocation()?.href ?? "";
}

export function getBrowserLocationOrigin() {
  return getBrowserLocation()?.origin ?? "";
}

export function getBrowserLocationHash() {
  return getBrowserLocation()?.hash ?? "";
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

export function getBrowserViewportSize(): BrowserViewportSize {
  const browserWindow = getBrowserWindow();

  return {
    height: browserWindow?.innerHeight ?? 0,
    width: browserWindow?.innerWidth ?? 0,
  };
}

export function getBrowserMediaQuery(query: string) {
  const browserWindow = getBrowserWindow();

  if (!browserWindow || typeof browserWindow.matchMedia !== "function") {
    return null;
  }

  return browserWindow.matchMedia(query);
}

export function isBrowserSecureContext() {
  return getBrowserWindow()?.isSecureContext ?? false;
}

export function hasBrowserWindowFeature(feature: PropertyKey) {
  const browserWindow = getBrowserWindow();

  return Boolean(browserWindow && feature in browserWindow);
}

export function decodeBrowserBase64(value: string) {
  return getBrowserWindow()?.atob(value) ?? globalThis.atob(value);
}

export function openBrowserWindow(
  url: string,
  target: string,
  features: string,
) {
  return getBrowserWindow()?.open(url, target, features) ?? null;
}

export function reloadBrowserLocation() {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return;
  }

  browserWindow.location.reload();
}

export function replaceBrowserLocation(url: string | URL) {
  const browserLocation = getBrowserLocation();

  if (!browserLocation) {
    return;
  }

  browserLocation.replace(url);
}

export function scrollBrowserTo(options: ScrollToOptions) {
  getBrowserWindow()?.scrollTo(options);
}

export function dispatchBrowserWindowEvent(event: Event) {
  return getBrowserWindow()?.dispatchEvent(event) ?? false;
}

export function addBrowserWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
): () => void;
export function addBrowserWindowEventListener(
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions,
): () => void;
export function addBrowserWindowEventListener(
  type: string,
  listener: EventListener,
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
