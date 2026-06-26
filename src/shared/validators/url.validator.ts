import { z } from "zod";

import { PLAN_COVER_PRESET_IDS } from "@/shared/lib/plan-cover";

const MAX_URL_LENGTH = 2048;
const MANAGED_UPLOAD_PREFIX = "uploads";
const GIPHY_MEDIA_HOST_PATTERN =
  /^(?:media(?:\d+)?\.giphy\.com|i\.giphy\.com)$/i;
const ASSET_TOKEN_MAX_LENGTH = 64;
const ASSET_TOKEN_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
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

function isPublicHttpUrl(value: unknown) {
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
    url.protocol !== "https:" ||
    url.hostname === "" ||
    hasCredentials(url) ||
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
    (typeof value === "string" &&
      (PLAN_COVER_PRESET_ID_SET.has(value) ||
        (value.length <= ASSET_TOKEN_MAX_LENGTH &&
          ASSET_TOKEN_PATTERN.test(value))))
  );
}

export function isGiphyMediaUrl(value: unknown) {
  const url = parseUrl(value);

  if (
    url === null ||
    url.protocol !== "https:" ||
    url.hostname === "" ||
    hasCredentials(url) ||
    hasUnsafePathSegment(url.pathname)
  ) {
    return false;
  }

  return GIPHY_MEDIA_HOST_PATTERN.test(url.hostname);
}

function isChatAttachmentUrl(value: unknown) {
  return isManagedUploadUrl(value) || isGiphyMediaUrl(value);
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

export const chatAttachmentUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .refine(isChatAttachmentUrl, {
    message: "Use an uploaded TeamForge asset or a trusted GIPHY media URL.",
  });

export const managedAssetReferenceSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .refine(isManagedAssetReference, {
    message: "Use a TeamForge cover preset or uploaded asset.",
  });
