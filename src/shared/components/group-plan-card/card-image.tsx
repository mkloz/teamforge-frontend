import { Image } from "@/shared/components/common/image";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

interface CardImageProps {
  alt: string;
  src?: string;
  variant?: GroupPlanCardVariant;
}

export function CardImage({ alt, src, variant = "default" }: CardImageProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border-border transition-colors duration-150 group-hover:border-ink dark:group-hover:border-white",
        isCompact
          ? "aspect-video w-full border-b-2"
          : "h-42 border-b-2 md:h-auto md:w-[37%] md:border-r-2 md:border-b-0",
      )}
    >
      <Image
        src={src}
        alt={alt}
        wrapperClassName="absolute inset-0"
        className="transition-[scale,transform] duration-700 ease-out will-change-transform group-hover:scale-105"
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
      className="relative h-full w-full overflow-hidden bg-canvas transition-[scale,transform] duration-700 ease-out will-change-transform group-hover:scale-105"
      role="img"
    >
      <div
        className="group-plan-card-empty-art absolute inset-0"
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
        className="group-plan-card-empty-art-core absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border md:size-9"
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
