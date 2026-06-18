import { config } from "@/config/config";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

function normalizeBaseUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    url.hash = "";
    url.search = "";

    return url.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

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
