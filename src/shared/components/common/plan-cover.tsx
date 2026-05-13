import type { ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

function isImageSource(value?: string | null) {
  return Boolean(value?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i));
}

interface PlanCoverProps {
  value?: string | null;
  alt: string;
  className?: string;
  fallbackComponent?: ReactNode;
  imageClassName?: string;
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
  loading = "lazy",
  loadingClassName,
  loadingComponent,
  noImageComponent,
  showNoImage,
}: PlanCoverProps) {
  const preset = getPlanCoverPreset(value);

  if (preset) {
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
      src={isImageSource(value) ? (value ?? undefined) : undefined}
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
