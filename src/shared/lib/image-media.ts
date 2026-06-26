import type { ImageMedia, ImageMediaVariant } from "@/shared/schemas/media";

const IMAGE_MEDIA_SRCSET_VARIANTS = [
  { variant: "card384", width: 384 },
  { variant: "cover800", width: 800 },
] satisfies ReadonlyArray<{ variant: ImageMediaVariant; width: number }>;

function getImageMediaVariantUrl(
  media: ImageMedia | null | undefined,
  variant: ImageMediaVariant,
) {
  return media?.variants[variant] ?? null;
}

function getImageMediaSrcSetCandidate(
  media: ImageMedia | null | undefined,
  { variant, width }: (typeof IMAGE_MEDIA_SRCSET_VARIANTS)[number],
) {
  const source = getImageMediaVariantUrl(media, variant);

  return source ? `${source} ${width}w` : null;
}

function isSrcSetCandidate(value: string | null): value is string {
  return Boolean(value);
}

export function getImageMediaVariant(
  media: ImageMedia | null | undefined,
  variant: ImageMediaVariant,
  fallback?: string | null,
) {
  return (
    getImageMediaVariantUrl(media, variant) ??
    fallback ??
    media?.originalUrl ??
    null
  );
}

export function getImageMediaSrcSet(
  media: ImageMedia | null | undefined,
  fallback?: string | null,
) {
  const sources = IMAGE_MEDIA_SRCSET_VARIANTS.map((variant) =>
    getImageMediaSrcSetCandidate(media, variant),
  ).filter(isSrcSetCandidate);

  if (sources.length > 0) {
    return sources.join(", ");
  }

  return fallback ? `${fallback} 800w` : undefined;
}
