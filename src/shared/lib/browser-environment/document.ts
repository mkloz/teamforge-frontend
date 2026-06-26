export function hasBrowserDocument() {
  return typeof document !== "undefined";
}

function getBrowserDocument() {
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
