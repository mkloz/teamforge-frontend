import { config } from "@/config/config";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import { normalizeBaseUrl } from "@/shared/lib/url-normalization";

export function getAppBaseUrl(fallback?: string | null) {
  const configuredUrl = normalizeBaseUrl(config.appUrl);

  if (configuredUrl) {
    return configuredUrl;
  }

  if (hasBrowserWindow()) {
    return window.location.origin;
  }

  return normalizeBaseUrl(fallback) ?? "";
}

export function buildAppUrl(path = "/", fallback?: string | null) {
  const baseUrl = getAppBaseUrl(fallback);

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const relativePath = path.replace(/^\/+/u, "");

  return new URL(relativePath, `${baseUrl}/`).toString();
}
