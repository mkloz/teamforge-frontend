import { scenarioRuntime } from "virtual:scenario-runtime";
import { config } from "@/config/config";
import { normalizeBaseUrl } from "@/shared/lib/url-normalization";

function getMediaBaseUrl() {
  const configuredBaseUrl = normalizeBaseUrl(config.mediaBaseUrl);

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return null;
}

export function buildMediaUrl(path: string) {
  const scenarioMediaUrl = scenarioRuntime.resolveMediaUrl(path);

  if (scenarioMediaUrl) {
    return scenarioMediaUrl;
  }

  const baseUrl = getMediaBaseUrl();

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return new URL(path.replace(/^\/+/u, ""), `${baseUrl}/`).toString();
}
