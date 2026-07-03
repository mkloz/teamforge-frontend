const noopBrowserCleanup = () => undefined;

export function hasBrowserDocument() {
  return typeof document !== "undefined";
}

export function getBrowserDocument() {
  return hasBrowserDocument() ? document : null;
}

export function getBrowserDocumentBody() {
  return getBrowserDocument()?.body ?? null;
}

export function getBrowserDocumentElement() {
  return getBrowserDocument()?.documentElement ?? null;
}

export function getBrowserActiveElement() {
  return getBrowserDocument()?.activeElement ?? null;
}

export function getBrowserVisibilityState() {
  return getBrowserDocument()?.visibilityState ?? "visible";
}

export function isBrowserDocumentVisible() {
  return getBrowserVisibilityState() !== "hidden";
}

export function getBrowserElementById(id: string) {
  return getBrowserDocument()?.getElementById(id) ?? null;
}

export function createBrowserElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
) {
  return getBrowserDocument()?.createElement(tagName) ?? null;
}

export function addBrowserDocumentEventListener<
  K extends keyof DocumentEventMap,
>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return noopBrowserCleanup;
  }

  browserDocument.addEventListener(type, listener, options);

  return () => {
    browserDocument.removeEventListener(type, listener, options);
  };
}
