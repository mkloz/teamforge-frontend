import { FileImage, Film, ImageOff } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";
import { cn } from "@/shared/lib/utils";

interface ThumbnailStripProps {
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({
  attachments,
  selectedIndex,
  onSelect,
}: ThumbnailStripProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    scrollElementIntoView(itemRefs.current[selectedIndex], {
      block: "nearest",
      inline: "nearest",
      intent: "reveal",
    });
  }, [selectedIndex]);

  function handleThumbnailKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const nextIndex = getThumbnailKeyboardIndex(
      event.key,
      index,
      attachments.length,
    );

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSelect(nextIndex);
    itemRefs.current[nextIndex]?.focus({ preventScroll: true });
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),0.75rem)] flex h-16 items-center justify-center px-14">
      <fieldset className="scrollbar-hide pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-xl border border-white/15 bg-black/65 p-2">
        <legend className="sr-only">Media thumbnails</legend>
        {attachments.map((media, index) => {
          const isSelected = selectedIndex === index;

          return (
            <Button
              key={media.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              variant="ghost"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(index)}
              onKeyDown={(event) => handleThumbnailKeyDown(event, index)}
              aria-label={getThumbnailAriaLabel(
                media,
                index,
                attachments.length,
              )}
              aria-pressed={isSelected}
              className={cn(
                "relative size-11 shrink-0 overflow-hidden rounded-lg border p-0 shadow-none transition-[border-color,opacity] duration-150 motion-reduce:transition-none",
                isSelected
                  ? "border-primary opacity-100 ring-2 ring-primary"
                  : "border-white/10 opacity-55 hover:opacity-100",
              )}
            >
              <StaticThumbnail media={media} position={index + 1} />
            </Button>
          );
        })}
      </fieldset>
    </div>
  );
}

function StaticThumbnail({
  media,
  position,
}: {
  media: UnifiedAttachment;
  position: number;
}) {
  const hasDistinctThumbnail = Boolean(
    media.thumbnailUrl && media.thumbnailUrl !== media.url,
  );

  if (hasDistinctThumbnail && media.thumbnailUrl) {
    return (
      <Image
        src={media.thumbnailUrl}
        alt=""
        aria-hidden="true"
        wrapperClassName="absolute inset-0"
        className="size-full object-cover"
        loading="lazy"
        loadingComponent={null}
        fallbackComponent={
          <StaticThumbnailPlaceholder media={media} position={position} />
        }
        showNoImage={false}
      />
    );
  }

  return <StaticThumbnailPlaceholder media={media} position={position} />;
}

function StaticThumbnailPlaceholder({
  media,
  position,
}: {
  media: UnifiedAttachment;
  position: number;
}) {
  const isGif = isGifAttachment(media);
  const Icon = isGif ? FileImage : media.type === "VIDEO" ? Film : ImageOff;

  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 grid place-items-center bg-white/8 text-white/70"
    >
      <Icon className="size-4" />
      <span className="absolute right-1 bottom-0.5 font-bold text-[10px] text-white/65">
        {position}
      </span>
    </span>
  );
}

export function getThumbnailAriaLabel(
  media: UnifiedAttachment,
  index: number,
  count: number,
) {
  const type = isGifAttachment(media)
    ? "GIF"
    : media.type === "VIDEO"
      ? "video"
      : "image";
  const name = media.name ? `: ${media.name}` : "";

  return `Show ${type} ${index + 1} of ${count}${name}`;
}

function getThumbnailKeyboardIndex(key: string, index: number, count: number) {
  if (key === "ArrowLeft") {
    return Math.max(0, index - 1);
  }

  if (key === "ArrowRight") {
    return Math.min(count - 1, index + 1);
  }

  if (key === "Home") {
    return 0;
  }

  return key === "End" ? count - 1 : null;
}
