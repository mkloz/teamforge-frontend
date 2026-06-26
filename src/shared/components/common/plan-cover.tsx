import type { ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";
import type { ImageMedia } from "@/shared/schemas/media";

function isImageSource(value?: string | null) {
  return Boolean(value?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i));
}

type PlanCoverRenderState =
  | {
      kind: "gradient";
      gradient: string;
    }
  | {
      kind: "image";
      src?: string;
    };
type PlanCoverPresetResult = ReturnType<typeof getPlanCoverPreset>;

interface PlanCoverProps {
  value?: string | null;
  alt: string;
  className?: string;
  fallbackComponent?: ReactNode;
  imageClassName?: string;
  media?: ImageMedia | null;
  loading?: "eager" | "lazy";
  loadingClassName?: string;
  loadingComponent?: ReactNode;
  noImageComponent?: ReactNode;
  showNoImage?: boolean;
}

function getMediaCoverSrc(media?: ImageMedia | null) {
  return media?.variants.cover800 ?? null;
}

function getFallbackImageSrc(
  value: string | null | undefined,
  mediaSrc: string | null,
) {
  return mediaSrc ?? (isImageSource(value) ? (value ?? undefined) : undefined);
}

function getGradientPresetRenderState(
  preset: PlanCoverPresetResult,
): PlanCoverRenderState | null {
  if (preset?.kind !== "gradient") {
    return null;
  }

  return {
    kind: "gradient",
    gradient: preset.gradient,
  };
}

function getPresetImageSrc(
  preset: PlanCoverPresetResult,
  mediaSrc: string | null,
) {
  if (preset?.kind !== "image") {
    return null;
  }

  return mediaSrc ?? preset.src;
}

function getPlanCoverRenderState({
  media,
  value,
}: Pick<PlanCoverProps, "media" | "value">): PlanCoverRenderState {
  const preset = getPlanCoverPreset(value);
  const mediaSrc = getMediaCoverSrc(media);
  const gradientState = getGradientPresetRenderState(preset);

  if (gradientState) {
    return gradientState;
  }

  return {
    kind: "image",
    src:
      getPresetImageSrc(preset, mediaSrc) ??
      getFallbackImageSrc(value, mediaSrc),
  };
}

export function PlanCover({
  value,
  alt,
  className,
  fallbackComponent,
  imageClassName,
  media,
  loading = "lazy",
  loadingClassName,
  loadingComponent,
  noImageComponent,
  showNoImage,
}: PlanCoverProps) {
  const renderState = getPlanCoverRenderState({ media, value });

  if (renderState.kind === "gradient") {
    return (
      <div
        aria-label={alt}
        className={cn(
          "size-full bg-linear-to-br transition-transform duration-500",
          renderState.gradient,
          className,
          imageClassName,
        )}
        role="img"
      />
    );
  }

  return (
    <Image
      src={renderState.src}
      alt={alt}
      loading={loading}
      wrapperClassName={className}
      className={imageClassName}
      fallbackComponent={fallbackComponent}
      loadingClassName={loadingClassName}
      loadingComponent={loadingComponent}
      noImageComponent={noImageComponent}
      showNoImage={showNoImage}
    />
  );
}
