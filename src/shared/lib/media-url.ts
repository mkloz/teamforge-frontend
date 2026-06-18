import { config } from "@/config/config";

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

export function getMediaBaseUrl() {
  return normalizeBaseUrl(config.mediaBaseUrl) ?? "";
}

export function buildMediaUrl(path: string) {
  const baseUrl = getMediaBaseUrl();

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return new URL(path.replace(/^\/+/u, ""), `${baseUrl}/`).toString();
}
