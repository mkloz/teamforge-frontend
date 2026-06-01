import { Image } from "@/shared/components/common/image";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { getImageMediaVariant } from "@/shared/lib/image-media";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";
import type { ImageMedia } from "@/shared/schemas/media";

interface CardImageProps {
  alt: string;
  media?: ImageMedia | null;
  priority?: "auto" | "high";
  src?: string;
  variant?: GroupPlanCardVariant;
}

export function CardImage({
  alt,
  media,
  priority = "auto",
  src,
  variant = "default",
}: CardImageProps) {
  const isCompact = variant === "compact";
  const imageSrc =
    getImageMediaVariant(media, "card384", null) ??
    getSizedImageUrl(src, isCompact ? 384 : 384);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border-border transition-colors duration-150 group-hover:border-ink dark:group-hover:border-white",
        isCompact
          ? "aspect-video w-full border-b-2"
          : "h-42 border-b-2 md:h-auto md:w-72 md:border-r-2 md:border-b-0",
      )}
    >
      <Image
        src={imageSrc ?? undefined}
        alt={alt}
        fetchPriority={priority === "high" ? "high" : "low"}
        loading={priority === "high" ? "eager" : "lazy"}
        showLoadingState={priority !== "high"}
        wrapperClassName="absolute inset-0"
        className="transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
        noImageComponent={<NoImagePlaceholder />}
        fallbackComponent={<NoImagePlaceholder />}
      />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/32" />
    </div>
  );
}

function NoImagePlaceholder() {
  return (
    <div
      aria-label="Opening without artwork"
      className="relative size-full overflow-hidden bg-canvas transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
      role="img"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,color-mix(in_srgb,var(--color-forge-teal)_16%,transparent),transparent_34%),radial-gradient(circle_at_72%_76%,color-mix(in_srgb,var(--color-spark-amber)_13%,transparent),transparent_32%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-5 top-5 h-px bg-border/55 md:inset-x-4"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-5 bottom-5 h-px bg-border/45 md:inset-x-4"
        aria-hidden="true"
      />
      <span
        className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--color-forge-teal)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-forge-teal)_7%,transparent)] shadow-[0_0_0_10px_color-mix(in_srgb,var(--color-forge-teal)_3.5%,transparent)] md:size-9"
        aria-hidden="true"
      />
      <span
        className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-spark-amber/75"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-4 left-5 h-8 w-px rotate-45 bg-forge-teal/30 md:left-1/2 md:h-10 md:-translate-x-1/2"
        aria-hidden="true"
      />
      <span
        className="absolute top-4 right-5 h-8 w-px rotate-45 bg-spark-amber/30 md:right-auto md:left-1/2 md:h-10 md:-translate-x-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
