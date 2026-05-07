import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useImageState } from "@/shared/hooks/use-image-state";
import { ImageOff, Play } from "lucide-react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";

interface ThumbnailStripProps {
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function ThumbnailItem({
  media,
  isSelected,
  onSelect,
}: {
  media: UnifiedAttachment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { state, onLoad, onError } = useImageState();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-label={`Open ${media.type === "VIDEO" ? "video" : "image"} thumbnail`}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "relative size-12 shrink-0 overflow-hidden rounded-lg p-0",
        "transition-[opacity,transform,filter] duration-200",
        "focus-visible:ring-forge-teal/50",
        isSelected
          ? "z-10 scale-110 opacity-100 ring-2 ring-forge-teal"
          : "opacity-40 grayscale-50 hover:opacity-100 hover:grayscale-0",
      )}
    >
      {/* Skeleton */}
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-white/10" />
      )}

      {/* Error */}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <ImageOff className="size-3.5 text-white/30" />
        </div>
      )}

      {media.type === "VIDEO" ? (
        <>
          <video
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={(event) => {
              cacheMediaIntrinsicSize(
                media.id,
                event.currentTarget.videoWidth,
                event.currentTarget.videoHeight,
              );
              onLoad();
            }}
            onError={onError}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              state === "loaded" ? "opacity-100" : "opacity-0",
            )}
          />
          {state === "loaded" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="size-3.5 fill-white text-white/90" />
            </div>
          )}
        </>
      ) : (
        <Image
          src={media.thumbnailUrl || media.url}
          alt=""
          onLoad={(event) => {
            cacheMediaIntrinsicSize(
              media.id,
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            );
            onLoad();
          }}
          onError={onError}
          wrapperClassName="absolute inset-0"
          className={cn(
            "transition-opacity duration-200",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
          loadingComponent={null}
          fallbackComponent={null}
          showNoImage={false}
        />
      )}
    </Button>
  );
}

export const ThumbnailStrip = memo(
  ({ attachments, selectedIndex, onSelect }: ThumbnailStripProps) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 flex h-16 items-center justify-center px-10">
      <div className="scrollbar-none pointer-events-auto flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur-2xl">
        {attachments.map((media, i) => (
          <ThumbnailItem
            key={media.id}
            media={media}
            isSelected={selectedIndex === i}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  ),
);
