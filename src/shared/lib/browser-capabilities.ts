import {
  hasBrowserNavigator,
  hasBrowserWindow,
} from "@/shared/lib/browser-environment";

export interface BrowserShareData {
  title: string;
  text: string;
  url?: string;
}

export type BrowserShareResult =
  | "shared"
  | "unavailable"
  | "dismissed"
  | "failed";

export function getCurrentBrowserUrl(fallback = "https://teamforge.app") {
  if (!hasBrowserWindow()) {
    return fallback;
  }

  return window.location.href;
}

export function getCurrentBrowserOrigin(fallback = "https://teamforge.app") {
  if (!hasBrowserWindow()) {
    return fallback;
  }

  return window.location.origin;
}

export function canShareBrowserData(shareData: BrowserShareData) {
  if (!hasBrowserNavigator() || typeof navigator.share !== "function") {
    return false;
  }

  return typeof navigator.canShare === "function"
    ? navigator.canShare(shareData)
    : true;
}

export async function shareBrowserData(
  shareData: BrowserShareData,
): Promise<BrowserShareResult> {
  if (!canShareBrowserData(shareData)) {
    return "unavailable";
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "dismissed";
    }

    return "failed";
  }
}

export async function copyTextToClipboard(value: string) {
  if (
    !hasBrowserNavigator() ||
    typeof navigator.clipboard?.writeText !== "function"
  ) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function openExternalUrl(url: string) {
  if (!hasBrowserWindow()) {
    return false;
  }

  return window.open(url, "_blank", "noopener,noreferrer") !== null;
}
