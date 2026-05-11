import { z } from "zod";

import { config } from "@/config/config";
import { PLAN_COVER_PRESET_IDS } from "@/shared/lib/plan-cover";

const MAX_URL_LENGTH = 2048;
const MANAGED_UPLOAD_PREFIX = "uploads";
const PLAN_COVER_PRESET_ID_SET = new Set<string>(PLAN_COVER_PRESET_IDS);

function parseUrl(value: unknown) {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function hasCredentials(url: URL) {
  return url.username !== "" || url.password !== "";
}

function hasUnsafePathSegment(pathname: string) {
  if (pathname.includes("\\")) {
    return true;
  }

  const [, ...segments] = pathname.split("/");

  return segments.some((segment) => {
    if (segment === "") {
      return true;
    }

    try {
      const decodedSegment = decodeURIComponent(segment);

      return decodedSegment === "." || decodedSegment === "..";
    } catch {
      return true;
    }
  });
}

function getAllowedUploadOrigins() {
  const origins = new Set<string>();
  const apiUrl = parseUrl(config.apiUrl);

  if (apiUrl) {
    origins.add(apiUrl.origin);
  }

  if (typeof window !== "undefined") {
    origins.add(window.location.origin);
  }

  return origins;
}

function hasManagedUploadProtocol(url: URL) {
  return (
    url.protocol === "https:" ||
    (!config.isProduction && url.protocol === "http:")
  );
}

export function isPublicHttpUrl(value: unknown) {
  const url = parseUrl(value);

  return (
    url !== null &&
    (url.protocol === "https:" || url.protocol === "http:") &&
    url.hostname !== "" &&
    !hasCredentials(url)
  );
}

export function isManagedUploadUrl(value: unknown) {
  const url = parseUrl(value);

  if (
    url === null ||
    !hasManagedUploadProtocol(url) ||
    url.hostname === "" ||
    hasCredentials(url) ||
    !getAllowedUploadOrigins().has(url.origin) ||
    url.search !== "" ||
    url.hash !== "" ||
    hasUnsafePathSegment(url.pathname)
  ) {
    return false;
  }

  const pathSegments = url.pathname.split("/").slice(1);

  return pathSegments.length >= 3 && pathSegments[0] === MANAGED_UPLOAD_PREFIX;
}

export function isManagedAssetReference(value: unknown) {
  return (
    isManagedUploadUrl(value) ||
    (typeof value === "string" && PLAN_COVER_PRESET_ID_SET.has(value))
  );
}

export const publicHttpUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .refine(isPublicHttpUrl, {
    message: "URL must be a valid http(s) URL without credentials.",
  });

export const managedUploadUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .refine(isManagedUploadUrl, {
    message: "Use an uploaded TeamForge asset URL.",
  });

export const managedAssetReferenceSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .refine(isManagedAssetReference, {
    message: "Use a TeamForge asset preset or uploaded asset URL.",
  });
