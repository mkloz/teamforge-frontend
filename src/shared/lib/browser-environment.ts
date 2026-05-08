import { warnInDevelopment } from "@/shared/lib/development-warning";

export function hasBrowserWindow() {
  return typeof window !== "undefined";
}

export function hasBrowserDocument() {
  return typeof document !== "undefined";
}

export function hasBrowserNavigator() {
  return typeof navigator !== "undefined";
}

export function getBrowserDocumentBody() {
  return hasBrowserDocument() ? document.body : null;
}

export function getBrowserDocumentElement() {
  return hasBrowserDocument() ? document.documentElement : null;
}

export function getBrowserActiveElement() {
  return hasBrowserDocument() ? document.activeElement : null;
}

export function getBrowserComputedStyle(element: Element) {
  return hasBrowserWindow() ? window.getComputedStyle(element) : null;
}

export function getBrowserDevicePixelRatio() {
  return hasBrowserWindow() ? window.devicePixelRatio || 1 : 1;
}

export function getBrowserScrollY() {
  return hasBrowserWindow() ? window.scrollY : 0;
}

export function getBrowserMediaQuery(query: string) {
  if (!hasBrowserWindow() || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(query);
}

export function getBrowserSessionStorageItem(key: string) {
  if (!hasBrowserWindow()) {
    return null;
  }

  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setBrowserSessionStorageItem(key: string, value: string) {
  if (!hasBrowserWindow()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, value);
  } catch (error) {
    warnInDevelopment("Session storage write failed.", error);
  }
}

export function reloadBrowserLocation() {
  if (!hasBrowserWindow()) {
    return;
  }

  window.location.reload();
}

export function addBrowserWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  if (!hasBrowserWindow()) {
    return () => undefined;
  }

  window.addEventListener(type, listener, options);

  return () => {
    window.removeEventListener(type, listener, options);
  };
}
