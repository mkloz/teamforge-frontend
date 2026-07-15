import { config } from "@/config/config";
import { normalizeBaseUrl } from "@/shared/lib/url-normalization";

const PUBLIC_SEED_MEDIA_BASE_URL =
  "https://mkloz-teamforge.s3.us-east-1.amazonaws.com";

function getMediaBaseUrl(path: string) {
  const configuredBaseUrl = normalizeBaseUrl(config.mediaBaseUrl);

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return isPublicSeedMediaPath(path) ? PUBLIC_SEED_MEDIA_BASE_URL : null;
}

export function buildMediaUrl(path: string) {
  const baseUrl = getMediaBaseUrl(path);

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return new URL(path.replace(/^\/+/u, ""), `${baseUrl}/`).toString();
}

function isPublicSeedMediaPath(path: string) {
  return /^\/?uploads\/seed-media\//u.test(path);
}
