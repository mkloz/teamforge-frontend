import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { Layers, Play } from "lucide-react";
import { ErrorMediaImageUnavailableVisual } from "@/features/activity/assets/error-media-image-unavailable";
import { ErrorMediaVideoUnavailableVisual } from "@/features/activity/assets/error-media-video-unavailable";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { ImageLoadState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";

interface GalleryItemLoadingSkeletonProps {
  isLoading: boolean;
}

interface GalleryItemErrorStateProps {
  mediaType: UnifiedAttachment["type"];
}

interface GalleryItemMediaProps {
  imageState: ImageLoadState;
  index: number;
  media: UnifiedAttachment;
  onGifError: () => void;
  onGifLoaded: () => void;
  onImageError: () => void;
  onImageLoaded: () => void;
  viewState: GalleryItemMediaViewState;
}

interface GalleryItemMediaViewState {
  hasGifLoaded: boolean;
  isGif: boolean;
  isVideoBackedGif: boolean;
  shouldLoadImage: boolean;
}

interface GalleryItemLoadedOverlaysProps {
  isGif: boolean;
  isVideo: boolean;
}

export function GalleryItemLoadingSkeleton({
  isLoading,
}: GalleryItemLoadingSkeletonProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isLoading && (
          <m.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Skeleton className="size-full" tone="muted" />
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

export function GalleryItemErrorState({
  mediaType,
}: GalleryItemErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60">
      {mediaType === "VIDEO" ? (
        <ErrorMediaVideoUnavailableVisual className="h-12 w-auto text-foreground" />
      ) : (
        <ErrorMediaImageUnavailableVisual className="h-12 w-auto text-foreground" />
      )}
      <span className="font-medium text-slate-muted/70 text-xs">
        Failed to load
      </span>
    </div>
  );
}

export function GalleryItemMedia({
  imageState,
  index,
  media,
  onGifError,
  onGifLoaded,
  onImageError,
  onImageLoaded,
  viewState,
}: GalleryItemMediaProps) {
  if (viewState.isVideoBackedGif) {
    return (
      <VideoBackedGifMedia
        media={media}
        onGifError={onGifError}
        onGifLoaded={onGifLoaded}
        viewState={viewState}
      />
    );
  }

  if (viewState.shouldLoadImage) {
    return (
      <GalleryImageMedia
        imageState={imageState}
        index={index}
        media={media}
        onImageError={onImageError}
        onImageLoaded={onImageLoaded}
        viewState={viewState}
      />
    );
  }

  return <VideoPlaceholderMedia />;
}

function VideoBackedGifMedia({
  media,
  onGifError,
  onGifLoaded,
  viewState,
}: Pick<
  GalleryItemMediaProps,
  "media" | "onGifError" | "onGifLoaded" | "viewState"
>) {
  return (
    <video
      src={media.url}
      poster={media.thumbnailUrl || undefined}
      aria-label={getVideoBackedGifLabel(media)}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(event) => {
        cacheMediaIntrinsicSize(
          media.id,
          event.currentTarget.videoWidth,
          event.currentTarget.videoHeight,
        );
        onGifLoaded();
      }}
      onError={onGifError}
      className={cn(
        "absolute inset-0 size-full object-cover transition-all duration-700 ease-out will-change-transform group-hover/gallery-item:scale-105",
        viewState.isGif && "object-contain",
        viewState.hasGifLoaded ? "opacity-100" : "opacity-0",
      )}
    >
      <track
        kind="captions"
        src="data:text/vtt,WEBVTT"
        srcLang="en"
        label="No captions available"
      />
    </video>
  );
}

function getVideoBackedGifLabel(media: UnifiedAttachment) {
  return media.name || "GIF preview";
}

function GalleryImageMedia({
  imageState,
  index,
  media,
  onImageError,
  onImageLoaded,
  viewState,
}: Pick<
  GalleryItemMediaProps,
  | "imageState"
  | "index"
  | "media"
  | "onImageError"
  | "onImageLoaded"
  | "viewState"
>) {
  return (
    <Image
      src={media.thumbnailUrl || media.url}
      alt={media.name || `Attachment ${index + 1}`}
      onLoad={(event) => {
        cacheMediaIntrinsicSize(
          media.id,
          event.currentTarget.naturalWidth,
          event.currentTarget.naturalHeight,
        );
        onImageLoaded();
      }}
      onError={onImageError}
      wrapperClassName="absolute inset-0"
      className={cn(
        "transition-all duration-700 ease-out will-change-transform group-hover/gallery-item:scale-110",
        viewState.isGif && "object-contain",
        imageState === "loaded" ? "opacity-100" : "opacity-0",
      )}
      loadingComponent={null}
      fallbackComponent={null}
      showNoImage={false}
    />
  );
}

function VideoPlaceholderMedia() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/70 text-slate-muted">
      <span className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary-soft text-foreground">
        <Play className="ml-0.5 size-5 fill-current" />
      </span>
      <span className="font-semibold text-xs">Video</span>
    </div>
  );
}

export function GalleryItemLoadedOverlays({
  isGif,
  isVideo,
}: GalleryItemLoadedOverlaysProps) {
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/gallery-item:opacity-100" />
      {isVideo && !isGif ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-sm">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
        </div>
      ) : null}
      {isGif ? (
        <span className="absolute top-2 left-2 rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 font-black text-white/90 text-xs leading-none tracking-wide backdrop-blur-sm">
          GIF
        </span>
      ) : null}
      <div className="absolute top-2 right-2 scale-90 rounded-lg border border-white/10 bg-black/20 p-1.5 opacity-0 backdrop-blur-md transition-all duration-200 group-hover/gallery-item:scale-100 group-hover/gallery-item:opacity-100">
        <Layers className="size-3.5 text-white/80" />
      </div>
      <div className="absolute inset-0 ring-0 ring-white/20 ring-inset transition-all duration-500 ease-out group-hover/gallery-item:ring-4" />
    </>
  );
}
