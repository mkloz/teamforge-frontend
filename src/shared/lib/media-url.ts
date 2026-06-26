import { config } from "@/config/config";
import { normalizeBaseUrl } from "@/shared/lib/url-normalization";

function getMediaBaseUrl() {
  return normalizeBaseUrl(config.mediaBaseUrl) ?? "";
}

export function buildMediaUrl(path: string) {
  const baseUrl = getMediaBaseUrl();

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return new URL(path.replace(/^\/+/u, ""), `${baseUrl}/`).toString();
}
