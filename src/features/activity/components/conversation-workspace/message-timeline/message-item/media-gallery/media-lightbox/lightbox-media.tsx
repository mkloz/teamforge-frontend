import { FileImage, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ErrorMediaImageUnavailableVisual } from "@/features/activity/assets/error-media-image-unavailable";
import { ErrorMediaVideoUnavailableVisual } from "@/features/activity/assets/error-media-video-unavailable";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";

export function LightboxImage({ media }: { media: UnifiedAttachment }) {
  if (isGifAttachment(media)) {
    return <LightboxGifImage media={media} />;
  }

  return <LightboxStillImage media={media} />;
}

function LightboxStillImage({ media }: { media: UnifiedAttachment }) {
  const { state, onLoad, onError } = useImageState();
  const viewState = getLightboxImageViewState(state);

  return (
    <div
      aria-busy={viewState.shouldShowLoading}
      className="relative flex size-full items-center justify-center"
    >
      <LightboxLoadingIndicator isVisible={viewState.shouldShowLoading} />

      <LightboxImageUnavailable isVisible={viewState.shouldShowError} />

      <Image
        src={media.url}
        alt={media.name || "Shared image"}
        onLoad={(event) => {
          cacheMediaIntrinsicSize(
            media.id,
            event.currentTarget.naturalWidth,
            event.currentTarget.naturalHeight,
          );
          onLoad();
        }}
        onError={onError}
        wrapperClassName="flex items-center justify-center overflow-visible size-full"
        className={cn(
          "max-h-full max-w-full select-none object-contain",
          "shadow-2xl ring-1 ring-white/5",
          "transition-opacity duration-150 motion-reduce:transition-none",
          viewState.mediaOpacityClassName,
        )}
        loading="eager"
        loadingComponent={null}
        fallbackComponent={null}
        showNoImage={false}
      />
    </div>
  );
}

export function LightboxVideo({ media }: { media: UnifiedAttachment }) {
  const [hasMetadata, setHasMetadata] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewState = getLightboxVideoViewState({
    hasError,
    hasMetadata,
    isGif: isGifAttachment(media),
  });

  useEffect(() => {
    const video = videoRef.current;

    function pauseWhenHidden() {
      if (document.visibilityState === "hidden") {
        video?.pause();
      }
    }

    document.addEventListener("visibilitychange", pauseWhenHidden);

    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      video?.pause();
    };
  }, []);

  return (
    <div
      aria-busy={viewState.shouldShowLoading}
      className="relative flex size-full items-center justify-center"
    >
      <LightboxLoadingIndicator isVisible={viewState.shouldShowLoading} />

      <LightboxVideoUnavailable
        isVisible={viewState.shouldShowError}
        label={viewState.errorLabel}
      />

      {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- The attachment contract has no caption source; an empty track would falsely claim captions exist. */}
      <video
        ref={videoRef}
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        aria-label={getLightboxVideoLabel(media, viewState.isGif)}
        autoPlay={false}
        controls
        loop={viewState.isGif}
        muted={viewState.isGif}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          cacheMediaIntrinsicSize(
            media.id,
            event.currentTarget.videoWidth,
            event.currentTarget.videoHeight,
          );
          setHasMetadata(true);
        }}
        onError={() => setHasError(true)}
        className={cn(
          "max-h-full max-w-full select-none",
          "shadow-2xl ring-1 ring-white/5",
          "transition-opacity duration-150 motion-reduce:transition-none",
          viewState.mediaOpacityClassName,
        )}
      />
    </div>
  );
}

function LightboxGifImage({ media }: { media: UnifiedAttachment }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hasDistinctPreview = Boolean(
    media.thumbnailUrl && media.thumbnailUrl !== media.url,
  );

  return (
    <div className="relative flex size-full items-center justify-center">
      {isPlaying ? (
        <Image
          src={media.url}
          alt={media.name || "Shared GIF"}
          wrapperClassName="flex size-full items-center justify-center overflow-visible"
          className="max-h-full max-w-full select-none object-contain shadow-2xl ring-1 ring-white/5 transition-opacity duration-150 motion-reduce:transition-none"
          loading="eager"
          loadingComponent={<LightboxLoadingIndicator isVisible />}
          fallbackComponent={<LightboxImageUnavailable isVisible />}
          showNoImage={false}
        />
      ) : hasDistinctPreview && media.thumbnailUrl ? (
        <Image
          src={media.thumbnailUrl}
          alt={getLightboxGifPreviewLabel(media)}
          wrapperClassName="flex size-full items-center justify-center overflow-visible"
          className="max-h-full max-w-full select-none object-contain opacity-80 shadow-2xl ring-1 ring-white/5"
          loading="eager"
          loadingComponent={<LightboxLoadingIndicator isVisible />}
          fallbackComponent={<LightboxGifPlaceholder />}
          showNoImage={false}
        />
      ) : (
        <LightboxGifPlaceholder label={getLightboxGifPreviewLabel(media)} />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label={isPlaying ? "Pause GIF" : "Play GIF"}
          onClick={() => setIsPlaying((current) => !current)}
          className="pointer-events-auto gap-1.5 rounded-full bg-black/75 text-white shadow-none hover:bg-black/90"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {isPlaying ? "Pause GIF" : "Play GIF"}
        </Button>
      </div>
    </div>
  );
}

function LightboxGifPlaceholder({
  label = "Shared GIF preview",
}: {
  label?: string;
}) {
  return (
    <div
      aria-label={label}
      className="flex size-full flex-col items-center justify-center gap-3 bg-white/5 text-white/65"
      role="img"
    >
      <FileImage className="size-12" aria-hidden="true" />
      <span className="text-sm">GIF preview</span>
    </div>
  );
}

function getLightboxGifPreviewLabel(media: UnifiedAttachment) {
  return media.name ? `${media.name} preview` : "Shared GIF preview";
}

type ImageLoadState = ReturnType<typeof useImageState>["state"];

function getLightboxImageViewState(state: ImageLoadState) {
  return {
    mediaOpacityClassName: getMediaOpacityClassName(state === "loaded"),
    shouldShowError: state === "error",
    shouldShowLoading: state === "loading",
  };
}

function getLightboxVideoViewState({
  hasError,
  hasMetadata,
  isGif,
}: {
  hasError: boolean;
  hasMetadata: boolean;
  isGif: boolean;
}) {
  return {
    errorLabel: isGif ? "GIF unavailable" : "Video unavailable",
    isGif,
    mediaOpacityClassName: getMediaOpacityClassName(hasMetadata),
    shouldShowError: hasError,
    shouldShowLoading: !hasMetadata && !hasError,
  };
}

function getMediaOpacityClassName(isVisible: boolean) {
  return isVisible ? "opacity-100" : "opacity-0";
}

function getLightboxVideoLabel(media: UnifiedAttachment, isGif: boolean) {
  if (media.name) {
    return media.name;
  }

  return isGif ? "Shared GIF" : "Shared video";
}

function LightboxLoadingIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Spinner strokeWidth={1.5} className="size-9 text-white/40" />
    </div>
  );
}

function LightboxImageUnavailable({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
      role="alert"
    >
      <ErrorMediaImageUnavailableVisual className="h-32 w-auto text-white" />
      <p className="font-medium text-white/40 text-xs">Image unavailable</p>
    </div>
  );
}

function LightboxVideoUnavailable({
  isVisible,
  label,
}: {
  isVisible: boolean;
  label: string;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
      role="alert"
    >
      <ErrorMediaVideoUnavailableVisual className="h-32 w-auto text-white" />
      <p className="font-medium text-white/40 text-xs">{label}</p>
    </div>
  );
}
