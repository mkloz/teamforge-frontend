import type { ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";
import type { ImageMedia } from "@/shared/schemas/media";

function isImageSource(value?: string | null) {
  return Boolean(value?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i));
}

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
  const preset = getPlanCoverPreset(value);
  const mediaSrc = media?.variants.cover800 ?? null;

  if (preset?.kind === "image") {
    return (
      <Image
        src={mediaSrc ?? preset.src}
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

  if (preset?.kind === "gradient") {
    return (
      <div
        aria-label={alt}
        className={cn(
          "size-full bg-linear-to-br transition-transform duration-500",
          preset.gradient,
          className,
          imageClassName,
        )}
        role="img"
      />
    );
  }

  return (
    <Image
      src={
        mediaSrc ?? (isImageSource(value) ? (value ?? undefined) : undefined)
      }
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
