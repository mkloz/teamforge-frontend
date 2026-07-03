import type { ActivityOption } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { isManagedUploadUrl } from "@/shared/validators/url.validator";

import {
  PLAN_COVER_PRESET_ID_SET,
  TEMPLATE_COVER_PRESET_IDS,
  TEMPLATE_PREVIEW_VARIANT_FILE_NAME,
  VARIANT_READY_ORIGINAL_PATH,
} from "./constants";

export function resolveTemplateCoverPreviewImage(seed: TemplateSeed) {
  const normalizedSource = seed.coverImageSource?.trim();

  if (!normalizedSource) {
    return null;
  }

  return getTemplateCoverPreviewVariant(normalizedSource) ?? normalizedSource;
}

export function resolvePersistedTemplateCoverImage(
  category: ActivityOption,
  seed: TemplateSeed,
) {
  const normalizedSource = seed.coverImageSource?.trim();

  if (
    normalizedSource &&
    (PLAN_COVER_PRESET_ID_SET.has(normalizedSource) ||
      isManagedUploadUrl(normalizedSource))
  ) {
    return normalizedSource;
  }

  const presetIndex = getStableIndex(
    `${category.id}:${seed.id}`,
    TEMPLATE_COVER_PRESET_IDS.length,
  );

  return TEMPLATE_COVER_PRESET_IDS[presetIndex] ?? null;
}

function getStableIndex(value: string, length: number) {
  if (length <= 0) {
    return 0;
  }

  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}

function getTemplateCoverPreviewVariant(source: string) {
  if (!isManagedUploadUrl(source)) {
    return null;
  }

  const url = new URL(source);

  if (!VARIANT_READY_ORIGINAL_PATH.test(url.pathname)) {
    return null;
  }

  url.pathname = url.pathname.replace(
    VARIANT_READY_ORIGINAL_PATH,
    `/${TEMPLATE_PREVIEW_VARIANT_FILE_NAME}`,
  );

  return url.toString();
}
