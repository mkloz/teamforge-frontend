import { Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { ErrorMediaImageUnavailableVisual } from "@/features/activity/assets/error-media-image-unavailable";
import { ErrorMediaVideoUnavailableVisual } from "@/features/activity/assets/error-media-video-unavailable";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";

export const LightboxImage = memo(function LightboxImage({
  media,
}: {
  media: UnifiedAttachment;
}) {
  const { state, onLoad, onError } = useImageState();
  const viewState = getLightboxImageViewState(state);

  return (
    <div className="relative flex size-full items-center justify-center">
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
          "transition-opacity duration-300",
          viewState.mediaOpacityClassName,
        )}
        loading="eager"
        loadingComponent={null}
        fallbackComponent={null}
        showNoImage={false}
      />
    </div>
  );
});

export const LightboxVideo = memo(function LightboxVideo({
  media,
}: {
  media: UnifiedAttachment;
}) {
  const [hasMetadata, setHasMetadata] = useState(false);
  const [hasError, setHasError] = useState(false);
  const viewState = getLightboxVideoViewState({
    hasError,
    hasMetadata,
    isGif: isGifAttachment(media),
  });

  return (
    <div className="relative flex size-full items-center justify-center">
      <LightboxLoadingIndicator isVisible={viewState.shouldShowLoading} />

      <LightboxVideoUnavailable
        isVisible={viewState.shouldShowError}
        label={viewState.errorLabel}
      />

      <video
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        autoPlay={viewState.isGif}
        controls={!viewState.isGif}
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
          "transition-opacity duration-300",
          viewState.mediaOpacityClassName,
        )}
      >
        <track
          kind="captions"
          src="data:text/vtt,WEBVTT"
          srcLang="en"
          label="No captions available"
        />
      </video>
    </div>
  );
});

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

function LightboxLoadingIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2
        strokeWidth={1.5}
        className="size-9 animate-spin text-white/40"
      />
    </div>
  );
}

function LightboxImageUnavailable({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <ErrorMediaVideoUnavailableVisual className="h-32 w-auto text-white" />
      <p className="font-medium text-white/40 text-xs">{label}</p>
    </div>
  );
}
