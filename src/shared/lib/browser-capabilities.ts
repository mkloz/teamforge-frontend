import { getAppBaseUrl } from "@/shared/lib/app-url";
import {
  getBrowserNavigator,
  openBrowserWindow,
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

export function getCurrentBrowserOrigin(fallback?: string) {
  return getAppBaseUrl(fallback);
}

export function canShareBrowserData(shareData: BrowserShareData) {
  const browserNavigator = getBrowserNavigator();

  if (!browserNavigator || typeof browserNavigator.share !== "function") {
    return false;
  }

  return typeof browserNavigator.canShare === "function"
    ? browserNavigator.canShare(shareData)
    : true;
}

export async function shareBrowserData(
  shareData: BrowserShareData,
): Promise<BrowserShareResult> {
  if (!canShareBrowserData(shareData)) {
    return "unavailable";
  }

  try {
    await getBrowserNavigator()?.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "dismissed";
    }

    return "failed";
  }
}

export async function copyTextToClipboard(value: string) {
  const browserNavigator = getBrowserNavigator();

  if (
    !browserNavigator ||
    typeof browserNavigator.clipboard?.writeText !== "function"
  ) {
    return false;
  }

  try {
    await browserNavigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function openExternalUrl(url: string) {
  return openBrowserWindow(url, "_blank", "noopener,noreferrer") !== null;
}
