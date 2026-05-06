import { Image } from "@/shared/components/common/image";
import { getExploreGroupDisplayTitle } from "@/shared/lib/explore-group-presenters";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface CardImageProps {
  group: ExploreGroup;
  variant?: "default" | "compact";
}

export function CardImage({ group, variant = "default" }: CardImageProps) {
  const isCompact = variant === "compact";
  const title = getExploreGroupDisplayTitle(group);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border-border transition-colors duration-150 group-hover:border-ink dark:group-hover:border-white",
        isCompact
          ? "w-full aspect-video border-b-2"
          : "h-56 md:h-auto md:w-2/5 border-b-2 md:border-b-0 md:border-r-2",
      )}
    >
      <Image
        src={group.avatar ?? undefined}
        alt={title}
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
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(13,148,136,0.16),transparent_34%),radial-gradient(circle_at_72%_76%,rgba(245,158,11,0.13),transparent_32%)]"
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
        className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-forge-teal/22 bg-forge-teal/[0.07] shadow-[0_0_0_10px_rgba(13,148,136,0.035)] md:size-9"
        aria-hidden="true"
      />
      <span
        className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-spark-amber/75"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-4 left-5 h-8 w-px rotate-45 bg-forge-teal/30 md:left-1/2 md:h-10 md:-translate-x-1/2"
        aria-hidden="true"
      />
      <span
        className="absolute right-5 top-4 h-8 w-px rotate-45 bg-spark-amber/30 md:left-1/2 md:right-auto md:h-10 md:-translate-x-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
