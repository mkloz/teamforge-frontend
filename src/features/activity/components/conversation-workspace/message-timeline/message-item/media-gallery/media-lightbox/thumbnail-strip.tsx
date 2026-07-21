import { ImageOff, Play } from "lucide-react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import {
  isGifAttachment,
  isGifVideoAttachment,
} from "@/features/activity/lib/gif-attachments";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";

interface ThumbnailStripProps {
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

interface ThumbnailItemProps {
  media: UnifiedAttachment;
  isSelected: boolean;
  onSelect: () => void;
}

interface ThumbnailMediaProps {
  imageState: ReturnType<typeof useImageState>["state"];
  isGif: boolean;
  media: UnifiedAttachment;
  onError: () => void;
  onLoad: () => void;
  shouldRenderVideo: boolean;
}

function ThumbnailItem({ media, isSelected, onSelect }: ThumbnailItemProps) {
  const { state, onLoad, onError } = useImageState();
  const isGif = isGifAttachment(media);
  const shouldRenderVideo =
    media.type === "VIDEO" || isGifVideoAttachment(media);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-label={getThumbnailAriaLabel(media, isGif)}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "relative size-12 shrink-0 overflow-hidden rounded-lg p-0",
        "transition-all duration-200",
        "focus-visible:ring-primary/50",
        isSelected
          ? "z-10 scale-110 opacity-100 ring-2 ring-primary"
          : "opacity-40 grayscale-50 hover:opacity-100 hover:grayscale-0",
      )}
    >
      <ThumbnailLoadingState isLoading={state === "loading"} />
      <ThumbnailErrorState hasError={state === "error"} />
      <ThumbnailMedia
        imageState={state}
        isGif={isGif}
        media={media}
        onError={onError}
        onLoad={onLoad}
        shouldRenderVideo={shouldRenderVideo}
      />
    </Button>
  );
}

function ThumbnailLoadingState({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }

  return (
    <Skeleton
      className="absolute inset-0 rounded-lg bg-white/10 ring-white/10"
      tone="muted"
    />
  );
}

function ThumbnailErrorState({ hasError }: { hasError: boolean }) {
  if (!hasError) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
      <ImageOff className="size-3.5 text-white/30" />
    </div>
  );
}

function ThumbnailMedia({
  imageState,
  isGif,
  media,
  onError,
  onLoad,
  shouldRenderVideo,
}: ThumbnailMediaProps) {
  if (shouldRenderVideo) {
    return (
      <ThumbnailVideo
        imageState={imageState}
        isGif={isGif}
        media={media}
        onError={onError}
        onLoad={onLoad}
      />
    );
  }

  return (
    <ThumbnailImage
      imageState={imageState}
      media={media}
      onError={onError}
      onLoad={onLoad}
    />
  );
}

function ThumbnailVideo({
  imageState,
  isGif,
  media,
  onError,
  onLoad,
}: Omit<ThumbnailMediaProps, "shouldRenderVideo">) {
  return (
    <>
      <video
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        aria-label={getThumbnailAriaLabel(media, isGif)}
        autoPlay={isGif}
        loop={isGif}
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
          "size-full object-cover transition-opacity duration-200",
          imageState === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
      <ThumbnailVideoLoadedOverlay imageState={imageState} isGif={isGif} />
    </>
  );
}

function ThumbnailVideoLoadedOverlay({
  imageState,
  isGif,
}: Pick<ThumbnailMediaProps, "imageState" | "isGif">) {
  if (imageState !== "loaded") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
      {isGif ? (
        <span className="rounded bg-black/35 px-1 font-black text-white/90 text-xs leading-3">
          GIF
        </span>
      ) : (
        <Play className="size-3.5 fill-white text-white/90" />
      )}
    </div>
  );
}

function ThumbnailImage({
  imageState,
  media,
  onError,
  onLoad,
}: Omit<ThumbnailMediaProps, "isGif" | "shouldRenderVideo">) {
  return (
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
        imageState === "loaded" ? "opacity-100" : "opacity-0",
      )}
      loadingComponent={null}
      fallbackComponent={null}
      showNoImage={false}
    />
  );
}

function getThumbnailAriaLabel(media: UnifiedAttachment, isGif: boolean) {
  const mediaType = isGif ? "GIF" : media.type === "VIDEO" ? "video" : "image";

  return `Open ${mediaType} thumbnail`;
}

export function ThumbnailStrip({
  attachments,
  selectedIndex,
  onSelect,
}: ThumbnailStripProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 flex h-16 items-center justify-center px-10">
      <div className="scrollbar-hide pointer-events-auto flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur-2xl">
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
  );
}
