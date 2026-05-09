import { ImageOff, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
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

  return (
    <div className="relative flex size-full items-center justify-center">
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            strokeWidth={1.5}
            className="size-9 animate-spin text-white/40"
          />
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ImageOff className="size-7 text-white/30" strokeWidth={1} />
          </div>
          <p className="font-medium text-white/40 text-xs uppercase tracking-wider">
            Image unavailable
          </p>
        </div>
      )}

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
          state === "loaded" ? "opacity-100" : "opacity-0",
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

  return (
    <div className="relative flex size-full items-center justify-center">
      {!hasMetadata && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            strokeWidth={1.5}
            className="size-9 animate-spin text-white/40"
          />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ImageOff className="size-7 text-white/30" strokeWidth={1} />
          </div>
          <p className="font-medium text-white/40 text-xs uppercase tracking-wider">
            Video unavailable
          </p>
        </div>
      )}

      <video
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        controls
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
          hasMetadata ? "opacity-100" : "opacity-0",
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
