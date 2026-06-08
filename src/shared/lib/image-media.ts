import type { ImageMedia, ImageMediaVariant } from "@/shared/schemas/media";

export function getImageMediaVariant(
  media: ImageMedia | null | undefined,
  variant: ImageMediaVariant,
  fallback?: string | null,
) {
  return media?.variants[variant] ?? fallback ?? media?.originalUrl ?? null;
}

export function getImageMediaSrcSet(
  media: ImageMedia | null | undefined,
  fallback?: string | null,
) {
  const sources = [
    media?.variants.card384 ? `${media.variants.card384} 384w` : null,
    media?.variants.cover800 ? `${media.variants.cover800} 800w` : null,
  ].filter(Boolean);

  if (sources.length > 0) {
    return sources.join(", ");
  }

  return fallback ? `${fallback} 800w` : undefined;
}
